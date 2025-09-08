import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jvgiyscchxxekcbdicco.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8"

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTables() {
  try {
    console.log('🔧 Creating reports tables...')

    // Create reports table
    const createReportsTable = `
      CREATE TABLE IF NOT EXISTS reports (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        report_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        timeframe VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'generating', 'failed')),
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Create report_schedules table
    const createSchedulesTable = `
      CREATE TABLE IF NOT EXISTS report_schedules (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        report_type VARCHAR(50) NOT NULL,
        frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
        recipient_email VARCHAR(255) NOT NULL,
        timeframe VARCHAR(50) NOT NULL,
        next_run_date TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Create report_views table
    const createViewsTable = `
      CREATE TABLE IF NOT EXISTS report_views (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Enable RLS
    const enableRLS = `
      ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
      ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
      ALTER TABLE report_views ENABLE ROW LEVEL SECURITY;
    `

    // Create RLS policies
    const createPolicies = `
      -- Reports policies
      DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
      CREATE POLICY "Users can view their own reports" ON reports
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
      CREATE POLICY "Users can insert their own reports" ON reports
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
      CREATE POLICY "Users can update their own reports" ON reports
        FOR UPDATE USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;
      CREATE POLICY "Users can delete their own reports" ON reports
        FOR DELETE USING (auth.uid() = user_id);

      -- Report schedules policies
      DROP POLICY IF EXISTS "Users can view their own report schedules" ON report_schedules;
      CREATE POLICY "Users can view their own report schedules" ON report_schedules
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert their own report schedules" ON report_schedules;
      CREATE POLICY "Users can insert their own report schedules" ON report_schedules
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update their own report schedules" ON report_schedules;
      CREATE POLICY "Users can update their own report schedules" ON report_schedules
        FOR UPDATE USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete their own report schedules" ON report_schedules;
      CREATE POLICY "Users can delete their own report schedules" ON report_schedules
        FOR DELETE USING (auth.uid() = user_id);

      -- Report views policies
      DROP POLICY IF EXISTS "Users can view their own report views" ON report_views;
      CREATE POLICY "Users can view their own report views" ON report_views
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert their own report views" ON report_views;
      CREATE POLICY "Users can insert their own report views" ON report_views
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `

    console.log('📝 Creating reports table...')
    const { error: reportsError } = await supabase.rpc('exec_sql', { sql: createReportsTable })
    if (reportsError) {
      console.log('⚠️  Reports table creation:', reportsError.message)
    } else {
      console.log('✅ Reports table created')
    }

    console.log('📝 Creating schedules table...')
    const { error: schedulesError } = await supabase.rpc('exec_sql', { sql: createSchedulesTable })
    if (schedulesError) {
      console.log('⚠️  Schedules table creation:', schedulesError.message)
    } else {
      console.log('✅ Schedules table created')
    }

    console.log('📝 Creating views table...')
    const { error: viewsError } = await supabase.rpc('exec_sql', { sql: createViewsTable })
    if (viewsError) {
      console.log('⚠️  Views table creation:', viewsError.message)
    } else {
      console.log('✅ Views table created')
    }

    console.log('🔒 Enabling RLS...')
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLS })
    if (rlsError) {
      console.log('⚠️  RLS enable:', rlsError.message)
    } else {
      console.log('✅ RLS enabled')
    }

    console.log('🛡️  Creating policies...')
    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: createPolicies })
    if (policiesError) {
      console.log('⚠️  Policies creation:', policiesError.message)
    } else {
      console.log('✅ Policies created')
    }

    console.log('🎉 Tables setup completed!')

  } catch (error) {
    console.error('❌ Error creating tables:', error)
  }
}

createTables()

