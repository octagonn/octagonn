-- Script to Separate Form Data Properly
-- Run this in your Supabase SQL Editor to clean up data separation

-- First, let's see what data exists in both tables
SELECT 'contact_submissions count' as table_name, COUNT(*) as count FROM contact_submissions
UNION ALL
SELECT 'web_form_submissions count' as table_name, COUNT(*) as count FROM web_form_submissions;

-- Check for potential duplicates (same email and created_at within 1 minute)
SELECT 
    'Potential duplicates found' as status,
    c.email,
    c.created_at as contact_submission_time,
    w.created_at as web_form_time,
    c.subject as contact_subject,
    w.subject as web_subject
FROM contact_submissions c
JOIN web_form_submissions w 
    ON c.email = w.email 
    AND ABS(EXTRACT(EPOCH FROM (c.created_at - w.created_at))) < 60 -- Within 1 minute
ORDER BY c.created_at DESC;

-- OPTIONAL: Remove duplicates from contact_submissions if they exist in web_form_submissions
-- (Only run this if you want to clean up duplicates)
/*
DELETE FROM contact_submissions 
WHERE id IN (
    SELECT c.id
    FROM contact_submissions c
    JOIN web_form_submissions w 
        ON c.email = w.email 
        AND ABS(EXTRACT(EPOCH FROM (c.created_at - w.created_at))) < 60
        AND c.is_from_customer = false -- Only remove non-customer submissions
);
*/

-- Verify the separation after cleanup
SELECT 
    'Final contact_submissions count' as table_name, 
    COUNT(*) as total,
    COUNT(CASE WHEN is_from_customer = true THEN 1 END) as from_customers,
    COUNT(CASE WHEN is_from_customer = false THEN 1 END) as from_anonymous
FROM contact_submissions
UNION ALL
SELECT 
    'Final web_form_submissions count' as table_name, 
    COUNT(*) as total,
    0 as from_customers, -- All web forms are anonymous
    COUNT(*) as from_anonymous
FROM web_form_submissions; 