require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function generateAttendance() {
  try {
    console.log('Fetching approved employees...');
    const { data: employees, error: empError } = await supabase
      .from('employee_profiles')
      .select('id, full_name')
      .eq('is_approved', true);

    if (empError) throw empError;

    if (!employees || employees.length === 0) {
      console.log('No approved employees found.');
      return;
    }

    const attendanceRecords = [];
    const year = 2026;
    const month = 8; // August

    // Generate attendance for August 1 to August 30
    for (const emp of employees) {
      for (let day = 1; day <= 30; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Skip Sundays (just as a realistic example, but we'll mark them present for simplicity if needed)
        // Actually let's just mark all 30 days present to make the LOP exactly 0 for the demo
        attendanceRecords.push({
          employee_id: emp.id,
          date: dateStr,
          check_in: `${dateStr}T09:00:00Z`,
          check_out: `${dateStr}T18:00:00Z`,
          status: 'present',
          work_location: 'WFO',
          working_hours: 9
        });
      }
    }

    console.log(`Inserting ${attendanceRecords.length} attendance records...`);
    const { error: insertError } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, { onConflict: 'employee_id, date' });

    if (insertError) throw insertError;
    
    console.log('Successfully generated full attendance for August 2026!');
  } catch (err) {
    console.error('Error:', err);
  }
}

generateAttendance();
