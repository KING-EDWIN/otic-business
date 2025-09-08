import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jvgiyscchxxekcbdicco.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testReportsConnection() {
  try {
    console.log('🧪 Testing Reports database connection...')

    // Test reports table
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .limit(5)

    if (reportsError) {
      console.log('❌ Reports table error:', reportsError.message)
    } else {
      console.log('✅ Reports table working!')
      console.log(`   Found ${reports.length} reports`)
      if (reports.length > 0) {
        console.log('   Sample report:', reports[0].title)
      }
    }

    // Test report_schedules table
    const { data: schedules, error: schedulesError } = await supabase
      .from('report_schedules')
      .select('*')
      .limit(5)

    if (schedulesError) {
      console.log('❌ Report schedules table error:', schedulesError.message)
    } else {
      console.log('✅ Report schedules table working!')
      console.log(`   Found ${schedules.length} schedules`)
    }

    // Test report_views table
    const { data: views, error: viewsError } = await supabase
      .from('report_views')
      .select('*')
      .limit(5)

    if (viewsError) {
      console.log('❌ Report views table error:', viewsError.message)
    } else {
      console.log('✅ Report views table working!')
      console.log(`   Found ${views.length} views`)
    }

    console.log('\n🎉 Reports database is ready!')
    console.log('🚀 You can now test the Reports dashboard at /reports')

  } catch (error) {
    console.error('❌ Error testing reports connection:', error)
  }
}

testReportsConnection()
