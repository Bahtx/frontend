Feature: Register
  In order to use the website
  As an guest
  I want to register new user

  Scenario: register new user successfully
    Given I am on the home page
    And I am not logged in
    And I mock createAccount
    And I follow "Create Account"
    Then I should see "Create Badger Account"
    And I fill in "first_name" with "John"
    And I fill in "last_name" with "Doe"
    And I fill in "email" with "tester1@eastagile.com"
    And I fill in "password" with "pwd123"
    And I fill in "password_confirmation" with "pwd123"
    # And I fill in "organization" with "East Agile"
    # And I fill in "phone" with "123456789"
    # And I fill in "fax" with "123456789"
    # And I fill in "address" with "Adress 123, ABC street"
    # And I fill in "city" with "HCM"
    # And I fill in "state" with "1"
    # And I fill in "zip" with "84"
    # And I select "Vietnam" from "country"
    And I check "agree_to_terms"
    And I mock neccessary data to mock login with 35 domain Credits and 5 invites available
    Then I press "Continue »"
    And The home page is fully loaded
    Then I should see "Welcome to Badger!"

  Scenario: When I am on the register page I want to see terms of service
    Given I am on the home page
    And I am not logged in
    And I mock createAccount
    And I follow "Create Account"
    Then I should see "Create Badger Account"
    And I should see "I agree to the Badger Terms of Service"

  Scenario: I should be able to see terms of service even if I am not logged in
    Given I am on the home page
    And I am not logged in
    And I mock getTermsOfServices
    And I view terms of service when registering
    Then I should see "Domain Name Services Agreement"

  # NOTE: this is now a server side message, not done in client side JS
  # Scenario: I see error when registering new user without checking terms of service
  #   Given I am on the home page
  #   And I am not logged in
  #   And I mock createAccount
  #   When I am on the register page
  #   And I fill in "first_name" with "East Agile"
  #   And I fill in "last_name" with "Company"
  #   And I fill in "email" with "tester1@eastagile.com"
  #   And I fill in "password" with "pwd123"
  #   And I fill in "password_confirmation" with "pwd123"
  #   And I uncheck "agree_to_terms"
  #   Then I press "Submit"
  #   Then I should see "You must accept terms of service to use our site"
    