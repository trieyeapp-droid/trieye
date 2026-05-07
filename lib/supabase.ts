import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xjpqeroyekgeynkltdpc.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcHFlcm95ZWtnZXlua2x0ZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjQxMTIsImV4cCI6MjA5Mzc0MDExMn0.V12VM4g-WxofLNQS7gs52N8Uen99b8qJk8OHm4faPcA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);