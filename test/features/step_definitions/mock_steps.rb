Given /^I mock domain search result for keys:$/ do |table|
  search_results = []
  table.hashes.each do |attributes|
    search_results << "case '#{attributes['key']}':
      callback({ data: { domains : [['#{attributes['key']}.com', #{attributes['com']}], 
                                    ['#{attributes['key']}.net', #{attributes['net']}],
                                    ['#{attributes['key']}.org', #{attributes['org']}]
                                   ] } });
      break;"
  end
  page.execute_script("Badger.domainSearch = function(query, use_serial, callback) {
    query = query.toString();
    switch (query) {
      #{search_results.join("\n")}
    }
  };")
end

Given /^I mock registerDomain api$/ do
  page.execute_script("Badger.registerDomain = function(data, callback) {
     callback.call(null,{ meta: {status: 'created'}, data: 'ok', domainmessage: 'true' });
  };")
end

Given /^I mock getDomainInfo api for (locked |)domain with registrar name "([^"]*)"$/ do |locked, registrar_name|
  page.execute_script("Badger.getDomainInfo = function(data, callback) {
       callback({data : {code: 1000, locked: #{locked == 'locked '}, pending_transfer: false, registrar: {name: '#{registrar_name}' }}, meta : {status: 'ok'}});
    };")
end

Given /^I mock getDomainInfo api for domains:$/ do |table|
  domains_info = []
  table.hashes.each do |attributes|
    domains_info << "case '#{attributes['name']}':
      if(data.auth_code != null)
        callback({data : {code: #{attributes['auth_code_response']} }, meta: { status: '#{attributes['auth_code_status']}' } });
      else
        callback({data : {code: 1000, locked: #{attributes['locked']}, pending_transfer: false, expires_at: '#{attributes['expires']}', registrar: {name: '#{attributes['registrar_name']}' }}, meta : {status: 'ok'}});
      break;"
  end

  page.execute_script("Badger.getDomainInfo = function(data, callback) {
    name = data.name.toString();
    switch (name) {
      #{domains_info.join("\n")}
    }
  };")
end

Given /^I mock getAccessToken return with "([^"]*)"$/ do |token|
  page.execute_script("Badger.getAccessToken = function() {
    return '#{token}';
  };")
end

Given /^I mock login$/ do
  page.execute_script("Badger.login = function(email, password, callback) {
    Badger.setAccessToken('2.1321519972.2e2cf079401b1c46cf748b80637610719a8ab693a');
    if (callback) callback({meta : {status : 'ok'}});
    for (var i=0; i < Badger.login_callbacks.length; i++) Badger.login_callbacks[i].call(null);
  };")

  # NOTE: THIS KILLS ALL REAL API CALLS
  page.execute_script("Badger.api = function(url){};")
end

Given /^I mock getDomains with ([^"]*) normal domains, ([^"]*) in transfer domain and ([^"]*) expiring soon domains$/ do |normal, transfer, expire|
  domains = []
  normal.to_i.times do |i|
    domains << "{ name: 'mydomain#{i}.com', expires_at: '2012-11-16T14:21:43Z' }"
  end
  transfer.to_i.times do |i|
    domains << "{ name: 'transfer#{i}.com', expires_at: '2012-11-16T14:21:43Z', permissions_for_person: ['pending_transfer'] }"
  end
  expire.to_i.times do |i|
    domains << "{ name: 'expiresoon#{i}.com', expires_at: '2011-11-30T14:21:43Z' }"
  end
  page.execute_script("Badger.getDomains = function(callback) {
    callback([#{domains.join(',')}]);
  };")

  page.execute_script(" BadgerCache.cached_domains = null;");
end

Given /^I mock accountInfo with name "([^"]*)" and ([^"]*) domain credits and ([^"]*) invites available$/ do |name, domain_credits, invites_available|
  page.execute_script("Badger.accountInfo = function(callback) {
    callback({data : {domain_credits: #{domain_credits}, name: '#{name}', invites_available: #{invites_available}}, meta : {status: 'ok'}});
  };")
   page.execute_script("BadgerCache.flush('account_info');");
end

Given /^I mock getContacts returns ([^"]*) contacts$/ do |n|
  contacts = []
  n.to_i.times do |n|
    contacts << "{ address: 'My address #{n}', address2: '', city: 'HCM', country: 'VN', created_at: '2011-11-12T14:29:26Z',
                      email: 'tester@eastagile.com', fax: '', first_name: 'East', id: #{n}, last_name: 'Agile Company', organization: '',
                      phone: '123456789', state: '1', zip: '084'}"
  end
  page.execute_script("Badger.getContacts = function(callback) {
    setTimeout(function() { callback({data: [ #{contacts.join(',')} ]}) }, 250);
  };")
  page.execute_script("BadgerCache.flush('contacts');")
end

Given /^I mock getPaymentMethods$/ do
  page.execute_script("Badger.getPaymentMethods = function(callback) {
    callback({data: [{id : 5, name: 'Visa (411111******1111 01/2012)'}]});
  };")
end

Given /^I mock createAccount$/ do
  page.execute_script("Badger.createAccount = function(data, callback){
    callback({ meta: { status: 'ok' }, data: { access_token: '2.1321519972.2e2cf079401b1c46cf748b80637610719a8ab693a' } });
    Badger.setAccessToken('2.1321519972.2e2cf079401b1c46cf748b80637610719a8ab693a');
    for (var i=0; i < Badger.login_callbacks.length; i++) Badger.login_callbacks[i].call(null);
    if (callback) callback({ meta: { status: 'ok' }, data: { access_token: '2.1321519972.2e2cf079401b1c46cf748b80637610719a8ab693a' } });
  };")
end

Given /^I mock sendEmail$/ do
  page.execute_script("Badger.sendEmail = function(data, callback) {
    callback({ meta: { status: 'ok' } });
  };")
end

Given /^I mock getDomain( with domain "([^"]*)"|)$/ do |with_domain, domain|
  page.execute_script("Badger.getDomain = function(name, callback){
    setTimeout(function() {
    callback({ meta: { status: 'ok' },
                data: {
                  name: '#{ domain ? domain : 'mydomain.com' }', available: true,
                  expires_on: '2011-11-30T04:21:43Z', status: 'active', registered_on: '2011-10-30T04:21:43Z',
                  created_at: '2011-10-30T04:21:43Z', updated_at: '2011-10-30T04:21:43Z', updated_on: '2011-10-30T04:21:43Z',
                  name_servers: ['ns1.badger.com', 'ns2.badger.com'], created_registrar: 'rhino', badger_registration: true,
                  whois: 'The data contained in this whois database is provided \"as is\" with no guarantee or warranties regarding its accuracy.',
                  current_registrar: 'Badger.com',  badger_dns: true, permissions_for_person: ['modify_dns'], dns: [],
                  registrant_contact: { address: 'My address', address2: '', city: 'HCM', country: 'VN', created_at: '2011-11-12T14:29:26Z',
                        email: 'tester@eastagile.com', fax: '', first_name: 'East', id: 4, last_name: 'Agile Company', organization: '',
                        phone: '123456789', state: '1', zip: '084' } }});
    }, 250);
  };")
end

Given /^I mock getDomain for domain "([^"]*)"(?: available for register "([^"]*)")?(?: with permission "([^"]*)")?(?: and transfer status "([^"]*)")?(?: and current registrar "([^"]*)")?$/ do |domain, register_available, permission, status, registrar|
  domain ||= "mydomain.com"
  register_available ||= false
  status ||= false
  permissions_for_person = (permission ? permission.split(',').map {|p| "'#{p}'" } : ["'modify_dns'", "'show_private_data'", "'change_nameservers'"])
  registrar ||= 'Badger.com'
  page.execute_script("Badger.getDomain = function(name, callback){
    callback({ meta: { status: 'ok' },
                data: {
                  name: '#{domain}', available: true, can_register: #{register_available}, transfer_status: '#{status}',
                  expires_on: '2011-11-30T04:21:43Z', status: 'active', registered_on: '2011-10-30T04:21:43Z',
                  created_at: '2011-10-30T04:21:43Z', updated_at: '2011-10-30T04:21:43Z', updated_on: '2011-10-30T04:21:43Z',
                  name_servers: ['ns1.badger.com', 'ns2.badger.com'], created_registrar: 'rhino', badger_registration: true,
                  whois: 'The data contained in this whois database is provided \"as is\" with no guarantee or warranties regarding its accuracy.',
                  current_registrar: '#{registrar}',  badger_dns: true, permissions_for_person: [#{permissions_for_person.join(',')}], dns: [],
                  registrant_contact: { address: 'My address', address2: '', city: 'HCM', country: 'VN', created_at: '2011-11-12T14:29:26Z',
                        email: 'tester@eastagile.com', fax: '', first_name: 'East', id: 4, last_name: 'Agile Company', organization: '',
                        phone: '123456789', state: '1', zip: '084' } }});
  };")
end

Given /^I mock getDomain with domain "([^"]*)" and dns:$/ do |domain, table|
  records = []
  table.hashes.each do |attributes|
    records << "{ id: #{attributes['id']}, domain_id: 2, record_type: '#{attributes['record_type']}', content: '#{attributes['content']}',
                  ttl: #{attributes['ttl']}, priority: '#{attributes['priority']}', subdomain: '#{attributes['subdomain'].empty? ? '' : "#{attributes['subdomain']}."}#{domain}', active: true }"
  end

  page.execute_script("Badger.getDomain = function(name, callback){
    callback({ meta: { status: 'ok' },
                data: {
                  name: '#{ domain }', expires_on: '2011-11-30T04:21:43Z', status: 'active', registered_on: '2011-10-30T04:21:43Z',
                  created_at: '2011-10-30T04:21:43Z', updated_at: '2011-10-30T04:21:43Z', updated_on: '2011-10-30T04:21:43Z',
                  name_servers: ['ns1.badger.com', 'ns2.badger.com'], created_registrar: 'rhino', badger_registration: true,
                  whois: 'The data contained in this whois database is provided \"as is\" with no guarantee or warranties regarding its accuracy.',
                  current_registrar: 'Badger.com', badger_dns: true, permissions_for_person: ['modify_dns', 'change_nameservers'],
                  dns: [#{records.join(',')}],
                  registrant_contact: { address: 'My address', address2: '', city: 'HCM', country: 'VN', created_at: '2011-11-12T14:29:26Z',
                        email: 'tester@eastagile.com', fax: '', first_name: 'East', id: 4, last_name: 'Agile Company', organization: '',
                        phone: '123456789', state: '1', zip: '084' } }});
  };")
end

Given /^I mock getRecords with empty records$/ do
  page.execute_script("Badger.getRecords = function(name, callback){
    callback([]);
  };")
end

Given /^I mock addRecord$/ do
  page.execute_script("Badger.addRecord = function(name, data, callback){
    callback({ meta: { status: 'ok'} });
  };")
end

Given /^I mock updateRecord with status "([^"]*)"$/ do |status|
  if status == 'ok'
    page.execute_script("Badger.updateRecord = function(name, id, data, callback){
      callback({ meta: { status: 'ok' }, data: {} });
    };")
  else
    page.execute_script("Badger.updateRecord = function(name, id, data, callback){
      callback({ meta: { status: 'unprocessable_entity' }, data: { message: 'Unable to update record' }});
    };")
  end
end

Given /^I mock sendInvite with status "([^"]*)"$/ do |status|
  page.execute_script("Badger.sendInvite = function(data, callback){
    callback({ meta : {status: '#{status}'}, data : { message: 'Notification message' } });
  };")
end

Given /^I mock confirmEmail with status "([^"]*)"$/ do |status|
  page.execute_script("Badger.confirmEmail = function(code, callback){
    setTimeout(function() { callback({ meta : {status: '#{status}'}, data : { message: 'Confirmation Email Notification message' } }); }, 250);
  };")
end

Given /^I mock requestInvite with status "([^"]*)"$/ do |status|
  page.execute_script("Badger.requestInvite = function(email, callback){
    setTimeout(function() {callback({ meta : {status: '#{status}'}, data : { #{status == "ok" ? "message: 'Ok', invite_request_id: '1'" : "message: 'Invalid email address'" } } }); }, 250);
  };")
end

Given /^I mock requestInviteExtraInfo with status "([^"]*)"$/ do |status|
  page.execute_script("Badger.requestInviteExtraInfo = function(data, callback){
    setTimeout(function() {callback({ meta : {status: '#{status}'}, data : { message: 'Ok' } }); }, 250);
  };")
end

Given /^I mock getInviteStatus with ([^"]*) accepted and ([^"]*) pending and ([^"]*) revoked$/ do |accepted_count, pending_count, revoked_count|
  invites = []
  accepted_count.to_i.times do |i|
    invites << "{name: 'Accepted Full Name #{i}', email: 'accepted_invite#{i}@example.com', date_sent: '2011-11-12T14:29:26Z',
                domain_credits: 3, accepted: true, id: '#{i}-accepted_invite#{i}@example.com', revoked_at: '' }"
  end
  pending_count.to_i.times do |i|
    invites << "{name: 'Pending Full Name #{i}', email: 'pending_invite#{i}@example.com', date_sent: '2011-10-12T14:29:26Z',
                domain_credits: 1, accepted: false, id: '#{i}-pending_invite#{i}@example.com', revoked_at: '' }"
  end
  revoked_count.to_i.times do |i|
    invites << "{name: 'Revoked Full Name #{i}', email: 'revoked_invite#{i}@example.com', date_sent: '2011-10-12T14:29:26Z',
                domain_credits: 1, accepted: false, id: '#{i}-revoked_invite#{i}@example.com', revoked_at: '2011-12-12T14:29:26Z' }"
  end

  page.execute_script("Badger.getInviteStatus = function(callback){
    setTimeout(function() {
      callback({data : [#{invites.join(',')}]});
    }, 250);
  };")

  page.execute_script(" BadgerCache.cached_invite_status = null;");
end

When /^I mock revokeInvite with status "([^"]*)" and message "([^"]*)"$/ do |status, message|
  page.execute_script("Badger.revokeInvite = function(invite_id, callback){
    setTimeout(function() {
      callback({ meta : {status: '#{status}'}, data : { message: '#{message}' } });
    }, 250);
  };")
end

When /^I mock remoteDNS for domain "([^"]*)"$/ do |domain|
  page.execute_script("Badger.remoteDNS = function(domain_name, callback){
    setTimeout(function() {
      callback({ meta : {status: 'ok'},
      data : [
        {record_type:'TXT', ttl:'1590', value:'v=spf1 include:_netblocks.#{domain} ip4:216.73.93.70/31 ip4:216.73.93.72/31 ~all ', subdomain:'#{domain}.'},
        {record_type:'A', ttl:'41', value:'74.125.71.99', subdomain:'#{domain}.'},
        {record_type:'MX', ttl:'600', value:'aspmx.l.#{domain}.', subdomain:'#{domain}.', priority:'10'},
        {record_type:'CNAME', ttl:'86399', value:'www.l.#{domain}.', subdomain:'www.#{domain}.'}] });
    }, 250);
  };")
end

When /^I mock purchaseCredits$/ do
  page.execute_script("Badger.purchaseCredits = function(invite_id, callback){
      callback({ meta : {status: 'ok'} });
  };")
end

When /^I mock createContact$/ do
  page.execute_script("Badger.createContact = function(invite_id, callback){
      callback({ meta : {status: 'ok'} });
  };")
end

When /^I mock deleteRecord/ do
  page.execute_script("Badger.deleteRecord = function(name, id, callback){
    Badger.getDomain = function(name, callback){
        callback({ meta: { status: 'ok' },
                    data: {
                      name: 'mydomain0.com', expires_on: '2011-11-30T04:21:43Z', status: 'active', registered_on: '2011-10-30T04:21:43Z',
                      created_at: '2011-10-30T04:21:43Z', updated_at: '2011-10-30T04:21:43Z', updated_on: '2011-10-30T04:21:43Z',
                      name_servers: ['ns1.badger.com', 'ns2.badger.com'], created_registrar: 'rhino', badger_registration: true,
                      whois: 'The data contained in this whois database is provided \"as is\" with no guarantee or warranties regarding its accuracy.',
                      current_registrar: 'Badger.com', badger_dns: true, permissions_for_person: ['modify_dns', 'change_nameservers'],
                      dns: [],
                      registrant_contact: { address: 'My address', address2: '', city: 'HCM', country: 'VN', created_at: '2011-11-12T14:29:26Z',
                            email: 'tester@eastagile.com', fax: '', first_name: 'East', id: 4, last_name: 'Agile Company', organization: '',
                            phone: '123456789', state: '1', zip: '084' } }});
      };
      callback({ meta : {status: 'ok'} });
  };")
end

When /^I mock remoteWhois( with privacy enabled|) with registrar name "([^"]*)"$/ do |privacy, registrar_name|
  page.execute_script("Badger.remoteWhois = function(domain_name, callback){
    callback( { data: {status: ['clientdeleteprohibited', 'clientRenewProhibited', 'clienttransferprohibited', 'clientUpdateProhibited'],
              created_registrar: '#{registrar_name}',
              privacy: #{privacy == ' with privacy enabled'}, updated_on: 'Thu May 12 00:00:00 +0700 2011',
              administrator_contact: {
                email: 'TOPZY.COM@domainsbyproxy.com',
                zip: '85260', organization: 'DomainsByProxy.com',
                state: 'Arizona', city: 'Scottsdale', fax: '(480) 624-2598',
                first_name: 'Private, Registration',
                country: '', phone: '(480) 624-2599', address: '15111 N. Hayden Rd., Ste 160, PMB 353' },
              registered_on: 'Tue May 19 00:00:00 +0700 2009',
              expires_on: 'Sat May 19 00:00:00 +0700 2012',
              technical_contact: {
                email: 'TOPZY.COM@domainsbyproxy.com',
                zip: '85260', organization: 'DomainsByProxy.com', state: 'Arizona',
                city: 'Scottsdale', fax: '(480) 624-2598', first_name: 'Private, Registration',
                country: '', phone: '(480) 624-2599', address: '15111 N. Hayden Rd., Ste 160, PMB 353'},
              name_servers: ['NS1.RACKSPACE.COM', 'NS2.RACKSPACE.COM'],
              name: 'topzy.com',
              registrant_contact: {
                email: '', zip: '85260', organization: 'DomainsByProxy.com',
                state: 'Arizona', city: 'Scottsdale', fax: '', first_name: 'Domains by Proxy, Inc.',
                country: '', phone: '', address: '15111 N. Hayden Rd., Ste 160, PMB 353' },
              whois: 'TERMS OF USE: You are not authorized to access or query ...'} });
  };")
end

When /^I mock getRecords for domain "([^"]*)"$/ do |domain|
  page.execute_script("Badger.getRecords = function(name, callback){
    callback([
      { id: 78, domain_id: 2, record_type: 'A', content: '244.245.123.19', ttl: 1800, priority: '',
        subdomain: 'subdomain.#{domain}', active: true },
      { id: 79, domain_id: 2, record_type: 'MX', content: 'smtp.badger.com', ttl: 1800, priority: 10,
        subdomain: '#{domain}', active: true },
      { id: 80, domain_id: 2, record_type: 'TXT', content: 'v=spf1 mx mx:rhinonamesmail.com ~all', ttl: 1800, priority: '',
        subdomain: '#{domain}', active: true },
      { id: 81, domain_id: 2, record_type: 'CNAME', content: 'ghs.google.com', ttl: 1800, priority: '',
        subdomain: 'calendar.#{domain}', active: true }
    ]
    );
  };")
end

When /^I mock getRecords for domain "([^"]*)" with records:$/ do |domain, table|
  records = []
  table.hashes.each do |attributes|
    records << "{ id: #{attributes['id']}, domain_id: 2, record_type: '#{attributes['record_type']}', content: '#{attributes['content']}',
                  ttl: #{attributes['ttl']}, priority: '#{attributes['priority']}', subdomain: '#{attributes['subdomain'].empty? ? '' : "#{attributes['subdomain']}."}#{domain}', active: true }"
  end
  page.execute_script("Badger.getRecords = function(name, callback){
    callback([ #{records.join(',')}]
    );
  };")
end

When /^I mock getEmailForwards for domain "([^"]*)"$/ do |domain|
  page.execute_script("Badger.getEmailForwards = function(domain, callback){
    callback( { data: [
      { id: 15, domain_id: 2, username: 'abc', destination: 'abc@abc.com', created_at: '2011-12-19 05:01:23', updated_at: '2011-12-19 05:01:23'},
      { id: 16, domain_id: 2, username: '*', destination: '*@abc.com', created_at: '2011-12-19 05:01:43', updated_at: '2011-12-19 05:01:43'}
    ] }
    );
  };")
end

When /^I mock deleteEmailForwards for domain "([^"]*)"$/ do |domain|
  page.execute_script("Badger.deleteEmailForward = function(domain, id, callback){
    callback({ meta : {status: 'ok'} });
  };")
end

When /^I mock getBlogs return with:$/ do |table|
  blogs = []
  table.hashes.each do |attributes|
    blogs << "{ id: #{attributes['id']}, title: '#{attributes['title']}', author: '#{attributes['author']}',
                body: '#{attributes['body']}', published_at: '#{attributes['published_at']}' }"
  end

  page.execute_script("Badger.getBlogs = function(callback){
    callback({ data: [ #{blogs.join(',')}] }
    );
  };")
end

When /^I mock getBlog return with:$/ do |table|
  attributes = table.hashes.first
  blogs = "{ id: #{attributes['id']}, title: '#{attributes['title']}', author: '#{attributes['author']}',
              body: '#{attributes['body']}', published_at: '#{attributes['published_at']}' }"

  page.execute_script("Badger.getBlog = function(id, callback){
    callback({ meta: { status: 'ok' }, data: #{blogs} }
    );
  };")
end

When /^I mock getBlog return false$/ do
  page.execute_script("Badger.getBlog = function(id, callback){
    callback({ meta: { status: 'not_found' }, data: { message: 'Cannot find blog' } }
    );
  };")
end

When /^I mock getFaqs return with:$/ do |table|
  faqs = []
  table.hashes.each do |attributes|
    faqs << "{ id: #{attributes['id']}, question: '#{attributes['question']}', answer: '#{attributes['answer']}' }"
  end
  page.execute_script("Badger.getFaqs = function(callback){
    callback({ data: [ #{faqs.join(',')}] } );
  };")
end

Given /^I mock getKnowledgeCenterArticles return with:$/ do |table|
  cats = {}
  table.hashes.map { |article| { article['category']=> [] } }.uniq.map{ |category| cats.merge!(category) }

  table.hashes.each do |attributes|
    cats[attributes['category']] << "{ id: #{attributes['id']}, title: '#{attributes['title']}', body: '#{attributes['body']}', category: '#{attributes['category']}' }"
  end

  results = []
  cats.each do |key, value|
    results << "'#{key}': [#{value.join(',')}]"
  end
  page.execute_script("Badger.getKnowledgeCenterArticles = function(callback){
    callback({ data: { #{results.join(',')}} } );
  };")
end

When /^I mock getKnowledgeCenterArticle return with:$/ do |table|
  attributes = table.hashes.first
  article = "{ id: #{attributes['id']}, title: '#{attributes['title']}', body: '#{attributes['body']}',
               category: '#{attributes['category']}' }"

  page.execute_script("Badger.getKnowledgeCenterArticle = function(id, callback){
    callback({ meta: { status: 'ok' }, data: #{article} }
    );
  };")
end

When /^I mock getKnowledgeCenterArticle return false$/ do
  page.execute_script("Badger.getKnowledgeCenterArticle = function(id, callback){
    callback({ meta: { status: 'not_found' }, data: { message: 'Cannot find article' } }
    );
  };")
end

When /^I mock sendPasswordResetEmail$/ do
  page.execute_script("Badger.sendPasswordResetEmail = function(data, callback){
    if (data.email == '')
      callback({ meta: { status: 'unprocessable_entity' }, data: { message: 'Email missing' } });
    else if (data.email == 'non-user@example.com')
      callback({ meta: { status: 'unprocessable_entity' }, data: { message: 'No account registered with this email' } });
    else
      callback({ meta: { status: 'ok' }, data: { message: 'An email has been sent to ' + data.email + ' with a password reset code.' } });
  };")
end

When /^I mock resetPasswordWithCode$/ do
  page.execute_script("Badger.resetPasswordWithCode = function(data, callback){
    if (data.code == 'invalid')
      callback({ meta: { status: 'unprocessable_entity' }, data: { message: 'Invalid Code' } });
    else
      callback({ meta: { status: 'ok' }, data: { message: 'Password reset' } });
  };")
end

When /^I mock changeEmail (successfully|unsuccessfully)$/ do |result|
  page.execute_script("Badger.changeEmail = function(data, callback){
    if ('#{result}' == 'successfully')
      callback({ meta: { status: 'ok' }, data: { message: 'Email Changed' } });
    else
      callback({ meta: { status: 'unprocessable_entity' }, data: { message: 'Unable to change email' } });
  };")
end

When /^I mock changeName$/ do
  page.execute_script("Badger.changeName = function(data, callback){
    callback({ meta: { status: 'ok' }, data: { message: 'Name Changed' } });
  };")
end

When /^I mock getTickets$/ do
  pending_tickets = "[{  'person': { 'name': 'John Doe', 'id': 1 },
                         'id': 1, 'created_at': '2012-01-28T15:39:29Z', status: 'open',
                         'updated_at': '2012-01-31T15:39:29Z',
                         'subject': 'Website Bug 0', 'category': 'Website Bug' }
                     ]"

  closed_tickets = "[{  'person': { 'name': 'John Doe', 'id': 1 },
                         'id': 2, 'created_at': '2012-01-28T15:39:29Z', status: 'closed',
                         'updated_at': '2012-01-31T15:39:29Z',
                         'subject': 'Request Feature 0', 'category': 'Request Feature' }
                     ]"

  page.execute_script("Badger.getTickets = function(callback){
    callback({ meta: { status: 'ok' }, data: { pending_tickets: #{pending_tickets}, closed_tickets: #{closed_tickets} } });
  };")
end

When /^I mock getTicket$/ do
  ticket = "{ 'person': { 'name': 'John Doe', 'id': 2 },
              'id': 1, 'created_at': '2012-01-28T15:39:29Z', status: 'open',
              'updated_at': '2012-01-31T15:39:29Z',
              'subject': 'Website Bug 0', 'category': 'Website Bug',
              'content': 'Some bug found on website',
              'attachments': [ { filename: 'attachment1.pdf', url: 'www.storage.com/attachment1.pdf' },
                               { filename: 'attachment2.pdf', url: 'www.storage.com/attachment2.pdf' }
                             ],
              'responses': [ { id: 2, ticket_id: 1, 'person': { 'name': 'Admin', 'id': 3 }, response: 'Website Bug response',
                               attachments: [{ filename: 'response_attachment.jpg', url: 'www.storage.com/response_attachment.jpg' }] }
                           ]
            }"

  page.execute_script("Badger.getTicket = function(id, callback){
    callback({ meta: { status: 'ok' }, data: #{ticket} });
  };")
end

When /^I mock createTicket$/ do
  page.execute_script("Badger.createTicket = function(data, callback){
    callback({ meta: { status: 'ok' }, data: { message: 'Ticket created' } });
  };")
end

When /^I mock addResponseTicket with response status "([^"]*)"$/ do |status|
  page.execute_script("Badger.addResponseTicket = function(id, data, callback){
    callback({ meta: { status: '#{status}' }, data: { message: 'Add Response Result' } });
  };")
end

When /^I mock transferDomain return status "([^"]*)"$/ do |status|
  page.execute_script("Badger.transferDomain = function(data, callback){
    callback({ meta: { status: 'ok' }, data: { transfer_status: '#{status}' } });
  };")
end