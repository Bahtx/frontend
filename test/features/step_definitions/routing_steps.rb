Given /^I am on the home page$/ do
  visit('/index.html')
  step 'I am not logged in'
  #page.execute_script("Badger.api_host = 'http://www.badger.dev/'; alert(Badger.api_host)")
end

Given /^I am on the register page$/ do
  visit('/index.html#account/create/code1')
end

Given /^I am on the invites page$/ do
  visit('/index.html#invites')
end

Given /^I visit the confirm email path$/ do
  visit("/index.html#confirm_email/confirm_code")
end

When /^I visit grid view "([^"]*)" of domains$/ do |filter|
  visit("/index.html#filter_domains/#{filter}/grid")
end

When /^I visit Badger DNS for domain "([^"]*)"$/ do |domain|
  visit("/index.html#domains/#{domain}/dns")
end

When /^I visit Registration for domain "([^"]*)"$/ do |domain|
  visit("/index.html#domains/#{domain}/registration")
end

When /^I visit Email Forwarding for domain "([^"]*)"$/ do |domain|
  visit("/index.html#domains/#{domain}/email_forwards")
end

Given /^I view terms of service when registering$/ do
  visit('/index.html#terms_of_service')
end

Given /^I am on the view blog page with blog_id "([^"]*)"$/ do |blog_id|
  visit("/index.html#blogs/#{blog_id}")
end

Given /^I am on the view knowledge center with id "([^"]*)"$/ do |kc_id|
  visit("/index.html#knowledge_center/#{kc_id}")
end

Given /^I view my domains list$/ do
  visit("/index.html#filter_domains/all/list")
end

Given /^I follow the reset password link for email "([^"]*)" with code "([^"]*)"$/ do |email, code|
  visit("/index.html#reset_password/#{email}/#{code}")
end

When /^I visit domain page for domain "([^"]*)"$/ do |domain|
  visit("/index.html#domains/#{domain}")
end