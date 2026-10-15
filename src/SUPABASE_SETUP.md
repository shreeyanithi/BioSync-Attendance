# BioSync - Supabase Connection Guide

## Overview
Your BioSync biometric attendance system is now connected to Supabase! Follow these steps to complete the integration.

## What's Already Done
✅ Supabase connection established  
✅ Color scheme updated to professional blue/grey/white/black palette  
✅ Logo updated with "BIO" (blue) + "Sync" (white) text  
✅ Collapsible sidebar with hamburger menu  
✅ All neon colors removed  
✅ Clean typography with proper font weights  

## Supabase Connection Steps

### 1. Access Your Supabase Project
- The system is already connected to your Supabase account
- Your project credentials are stored securely in the environment

### 2. Database Tables You'll Need

Create these tables in your Supabase dashboard (SQL Editor):

```sql
-- People/Employees Table
CREATE TABLE people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('Student', 'Staff', 'Admin')),
  department TEXT NOT NULL,
  biometric_id TEXT UNIQUE NOT NULL,
  enrolled_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Records Table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
  device_id TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices Table
CREATE TABLE devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline')),
  model TEXT NOT NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  last_sync TIMESTAMP WITH TIME ZONE,
  scans_today INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  user_name TEXT NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);
```

### 3. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (example for authenticated users)
CREATE POLICY "Allow authenticated read access" ON people
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert" ON people
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Repeat similar policies for other tables
```

### 4. Update Frontend to Use Supabase

The connection is already established. To fetch real data from Supabase instead of mock data:

**Example for People View:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Fetch people
const { data: people, error } = await supabase
  .from('people')
  .select('*')
  .order('enrolled_date', { ascending: false });
```

### 5. Biometric Device Integration

To connect actual biometric hardware:

1. Your biometric devices should send scan data to a webhook/API endpoint
2. Create a Supabase Edge Function to receive biometric data
3. Store scans in the `attendance` table with device_id and timestamp

**Example Edge Function:**
```typescript
// /supabase/functions/biometric-scan/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { biometric_id, device_id, timestamp } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Find person by biometric ID
  const { data: person } = await supabase
    .from('people')
    .select('*')
    .eq('biometric_id', biometric_id)
    .single();
  
  if (person) {
    // Record attendance
    await supabase.from('attendance').insert({
      person_id: person.id,
      check_in_time: timestamp,
      status: 'Present',
      device_id,
      date: new Date(timestamp).toISOString().split('T')[0]
    });
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### 6. Next Steps

1. **Create Tables**: Run the SQL commands in your Supabase SQL Editor
2. **Seed Data**: Add some initial test data
3. **Update Components**: Replace mock data with Supabase queries
4. **Configure Authentication**: Set up Supabase Auth for login
5. **Deploy Edge Functions**: For biometric device webhooks

## Support

- Supabase Docs: https://supabase.com/docs
- BioSync Color Palette: Blue (#1E40AF), Grey (various shades), White, Black
- Status Colors: Green (present), Red (absent), Amber (late)

## Current Features

✅ Collapsible sidebar with hamburger menu  
✅ 8 navigation sections: Dashboard, People, Attendance, Devices, Reports, Security, Settings, Help  
✅ Professional color scheme (no neon)  
✅ Blue avatar circles with white initials  
✅ Clean typography with proper font weights  
✅ Hover states using #1E40AF blue  
✅ Ready for Supabase data integration  
