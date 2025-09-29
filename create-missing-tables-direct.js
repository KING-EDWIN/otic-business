// Create missing database tables using service role key
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvgiyscchxxekcbdicco.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzE0NzQxMCwiZXhwIjoyMDcyNzIzNDEwfQ.T32BoPNQFJJ-x5K8l9XmzXQTW1q85SnmiN82a_DRxeo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createMissingTables() {
  console.log('🔧 Creating missing database tables...')
  
  try {
    // Create business_individual_access table
    console.log('Creating business_individual_access table...')
    const createAccessTable = `
      CREATE TABLE IF NOT EXISTS business_individual_access (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        access_level TEXT NOT NULL DEFAULT 'limited' CHECK (access_level IN ('limited', 'standard', 'full')),
        permissions TEXT[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_accessed TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, business_id)
      );
    `
    
    const { error: accessError } = await supabaseAdmin.rpc('exec', { sql: createAccessTable })
    
    if (accessError) {
      console.log('❌ Error creating business_individual_access:', accessError.message)
    } else {
      console.log('✅ business_individual_access table created')
    }
    
    // Create business_invitations table
    console.log('Creating business_invitations table...')
    const createInvitationsTable = `
      CREATE TABLE IF NOT EXISTS business_invitations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        invited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'employee',
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
        message TEXT,
        invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
        responded_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(business_id, invited_user_id)
      );
    `
    
    const { error: invitationsError } = await supabaseAdmin.rpc('exec', { sql: createInvitationsTable })
    
    if (invitationsError) {
      console.log('❌ Error creating business_invitations:', invitationsError.message)
    } else {
      console.log('✅ business_invitations table created')
    }
    
    // Enable RLS
    console.log('Enabling RLS...')
    const enableRLS = `
      ALTER TABLE business_individual_access ENABLE ROW LEVEL SECURITY;
      ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;
    `
    
    const { error: rlsError } = await supabaseAdmin.rpc('exec', { sql: enableRLS })
    
    if (rlsError) {
      console.log('❌ Error enabling RLS:', rlsError.message)
    } else {
      console.log('✅ RLS enabled')
    }
    
    // Create RLS policies
    console.log('Creating RLS policies...')
    const createPolicies = `
      -- RLS Policies for business_individual_access
      CREATE POLICY "Users can view their own business access" ON business_individual_access
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Business owners can manage access to their business" ON business_individual_access
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = business_individual_access.business_id 
            AND businesses.owner_id = auth.uid()
          )
        );

      -- RLS Policies for business_invitations
      CREATE POLICY "Users can view invitations sent to them" ON business_invitations
        FOR SELECT USING (auth.uid() = invited_user_id);

      CREATE POLICY "Business owners can manage invitations for their business" ON business_invitations
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = business_invitations.business_id 
            AND businesses.owner_id = auth.uid()
          )
        );

      CREATE POLICY "Users can update invitation status" ON business_invitations
        FOR UPDATE USING (auth.uid() = invited_user_id);
    `
    
    const { error: policiesError } = await supabaseAdmin.rpc('exec', { sql: createPolicies })
    
    if (policiesError) {
      console.log('❌ Error creating policies:', policiesError.message)
    } else {
      console.log('✅ RLS policies created')
    }
    
    // Create indexes
    console.log('Creating indexes...')
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_business_individual_access_user_id ON business_individual_access(user_id);
      CREATE INDEX IF NOT EXISTS idx_business_individual_access_business_id ON business_individual_access(business_id);
      CREATE INDEX IF NOT EXISTS idx_business_individual_access_active ON business_individual_access(is_active);
      CREATE INDEX IF NOT EXISTS idx_business_invitations_invited_user ON business_invitations(invited_user_id);
      CREATE INDEX IF NOT EXISTS idx_business_invitations_business_id ON business_invitations(business_id);
      CREATE INDEX IF NOT EXISTS idx_business_invitations_status ON business_invitations(status);
    `
    
    const { error: indexesError } = await supabaseAdmin.rpc('exec', { sql: createIndexes })
    
    if (indexesError) {
      console.log('❌ Error creating indexes:', indexesError.message)
    } else {
      console.log('✅ Indexes created')
    }
    
    // Test the tables
    console.log('Testing tables...')
    const { data: accessTest, error: accessTestError } = await supabaseAdmin
      .from('business_individual_access')
      .select('id')
      .limit(1)
    
    if (accessTestError) {
      console.log('❌ business_individual_access test failed:', accessTestError.message)
    } else {
      console.log('✅ business_individual_access table working')
    }
    
    const { data: invitationsTest, error: invitationsTestError } = await supabaseAdmin
      .from('business_invitations')
      .select('id')
      .limit(1)
    
    if (invitationsTestError) {
      console.log('❌ business_invitations test failed:', invitationsTestError.message)
    } else {
      console.log('✅ business_invitations table working')
    }
    
    console.log('🎉 All tables created successfully!')
    
  } catch (error) {
    console.error('❌ Create tables failed:', error)
  }
}

// Run the table creation
createMissingTables()
