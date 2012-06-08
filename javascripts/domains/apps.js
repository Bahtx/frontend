with (Hasher('Application')) {
  // TODO: this despearetly needs to be cached
  define('load_domain', function(domain, callback) {
    var that = this;
    
    Badger.getDomain(domain, function(response) {
      if (response.meta.status == 'ok') {
        callback.call(that, response.data);
      } else {
        return null;
      }
    });
  });
}

with (Hasher('DomainApps','Application')) {
  define('h1_for_domain', function(domain, current_header) {
    return h1({ 'class': 'h1_for_domains' }, 
      a({ href: '#domains' }, 'My Domains'), 
      ' » ', 
      current_header ? [
        a({ href: '#domains/' + domain, 'class': 'long-domain-name' }, domain), 
        ' » ', 
        current_header
      ] : [
        domain
      ]
    );
  });
  
  define('domain_nav_table', function() {
    // TODO: Not quite ready
    return arguments;
    
    
    var active_url = get_route();
    var domain = active_url.split('/')[1];
    
    return table({ style: 'width: 100%' }, tbody(
      tr(
        td({ style: 'width: 200px; vertical-align: top' },
          ul({ id: 'domains-left-nav' },
            [
              ['Applications', '#domains/' + domain],
              ['Registration', '#domains/' + domain + '/registration'],
              ['DNS', '#domains/' + domain + '/dns']
            ].map(function(pair) {
              return li(a({ href: pair[1], 'class': (active_url == pair[1] ? 'active' : '') }, pair[0]));
            })
          )
        ),
        
        td({ style: 'vertical-align: top'},
          arguments
        )
      )
    ));
  });
  
  
  define('install_app_button_clicked', function(app, domain_obj, form_data) {
    if (form_data.install_on_subdomain && form_data.subdomain == "") {
      $('#subdomain-input-error').removeClass('hidden');
      $('#subdomain-input-error').html('Subdomain cannot be blank')
      return;
    }
    start_modal_spin('Processing...');
    install_app_on_domain(app, domain_obj, form_data);
  });

  define('install_app_success', function(app, domain_obj) {
    hide_modal();
    $('#domain-menu-item-' + domain_obj.name.replace('.','-')).remove();
    set_route(app.menu_item.href.replace(':domain', domain_obj.name));
  });

  define('install_app_fail_notification', function(app, conflict_apps, domain, form_data) {
    show_modal(
      h1(app.name + ' Installation Failed'),
      p('Installation failed due to conflict with the following app' + (conflict_apps.length > 1 ? 's:' : ':')),
      table({ 'class': 'fancy-table' }, tbody(
        conflict_apps.map(function(conflict_app) {
          return tr(
            td(conflict_app.name),
            td(
              conflict_app.id == 'user_dns' ? [
                'Please remove ', conflict_app.requires.dns.length > 1 ? 'these conflict DNS records' : 'this conflict DNS record', ' in Badger DNS: ',
                table({ style: 'width: 100%;' }, tbody(
                  conflict_app.requires.dns.map(function(record) {
                    return tr({ id: 'dns-row-' + record.id },
                      td(record.record_type.toUpperCase()),
                      td(div({ 'class': 'long-domain-name', style: 'width: 150px;' }, record.subdomain.replace(domain,''), span({ style: 'color: #888' }, domain))),
                      td(record.priority, ' ', Domains.truncate_domain_name(record.content))
                    );
                  })
                ))
              ] : [
                div({ style: 'text-align: right' }, 
                  a({ id: conflict_app.id + '_uninstall_button', 'class': 'myButton small', href: curry(remove_conflict_app, app, conflict_app, domain, form_data) }, 'Uninstall'),
                  img({ id: conflict_app.id + '_uninstall_spinner', 'class': 'hidden', src: 'images/ajax-loader.gif' })
                )
              ]
            )
          );
        })
      )),
      div({ style: 'text-align: center; margin-top: 20px;' }, a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Cancel"))
    );
  });

  define('install_confirm', function(app, domain_obj, form_data) {
    show_modal(
      h1('Install ', app.name, ' Confirmation'),
      p('To install this application, click the Install button below.'),
      a({ 'class': 'myButton', href: curry(install_app_button_clicked, app, domain_obj, form_data) }, "Install " + app.name)
    );
  });

  define('remove_conflict_app', function(app, conflict_app, domain, form_data) {
    $('#' + conflict_app.id + '_uninstall_button').css('visibility', 'hidden');
    $('#' + conflict_app.id + '_uninstall_spinner').removeClass('hidden');
    load_domain(domain, function(domain_obj) {
      remove_app_from_domain(conflict_app, domain_obj, function() {
        load_domain(domain, function(domain_obj) {
          show_modal(
            h1(conflict_app.name, ' Was Uninstalled'),
            p('To continue installing ' + app.name + ', click the Install button below.'),
            div({ style: 'text-align: center' },
              a({ 'class': 'myButton', href: curry(install_app_on_domain, app, domain_obj, form_data, true) }, "Install " + app.name)
            )
          );
        });
      });
    });
  });

  define('show_modal_install_app', function(app, domain_obj) {  
    show_modal(
      h1({ 'class': 'long-domain-name' }, app.name, " for ", domain_obj.name),

      ((app.requires && app.requires.dns && domain_obj.name_servers.join(',') != 'ns1.badger.com,ns2.badger.com') ? 
        div({ 'class': 'error-message', style: 'margin-top: 20px' }, 
          "Please install Badger DNS and try again.", 
          span({ style: 'padding-right: 20px'}, ' '), 
          div({ style: 'float: right' }, a({ 'class': 'myButton small', href: curry(DnsApp.change_name_servers_modal, domain_obj) }, 'Install Badger DNS'))
        )
      : app.install_screen ? app.install_screen(app, domain_obj) : [
        table({ 'class': 'fancy-table' },
          tbody(
            tr({ 'class': 'table-header' },
              th({ style: 'text-align: right; padding-right: 20px' }, 'Subdomain'),
              th({ style: 'padding: 0 20px' }, 'Type'),
              th({ style: 'width: 100%' }, 'Target')
            ),
            for_each(app.requires.dns, function(dns) { 
              return tr(
                td({ style: 'text-align: right; padding-right: 20px' }, dns.subdomain, span({ style: 'color: #aaa' }, dns.subdomain ? '.' : '', Domains.truncate_domain_name(domain_obj.name))),
                td({ style: 'padding: 0 20px' }, dns.type.toUpperCase()),
                td(dns.priority, ' ', dns.content),
                td(domain_has_record(domain_obj, dns) ? 'yes' : 'no')
              );
            })
          )
        ),

        div({ style: 'padding-top: 20px; text-align: right' }, 
          a({ 'class': 'myButton', href: curry(install_app_button_clicked, app, domain_obj) }, 'Install ', app.name)
        )
      ])

    );
  });

  define('show_required_dns', function(app, domain_obj) {
    return [
      app.requires.subdomain_dns ? [
        div({ id: 'subdomain-input-error', 'class': 'error-message hidden' }),
        input({ id: 'install_on_subdomain', type: 'checkbox', name: 'install_on_subdomain',
                value: false, events: { change: display_require_dns_table } }),
        label({ 'for': 'install_on_subdomain' }, 'Install ' + app.name + ' on subdomain: ' ),
        text({ id: 'subdomain', name: 'subdomain', 'class': 'fancy', style: 'width: 120px; height: 12px;' })
      ] : '',
      a({
          href: function() {
            if ($('#hide-show-button').hasClass('expand-button')) {
              $('.require-dns-table').removeClass('hidden') ;
              $('#hide-show-button').removeClass('expand-button').addClass('collapse-button');
            } else {
              $('.require-dns-table').addClass('hidden') ;
              $('#hide-show-button').removeClass('collapse-button').addClass('expand-button');
            }
          }
        },
        div({ id: 'hide-show-button', 'class': 'expand-button' }, 'DNS records to be installed')
      ),
      render_require_dns_table(domain_obj.name, app, true),
      app.requires.subdomain_dns ? render_require_dns_table(domain_obj.name, app, false) : ''
    ];
  });

  define('display_require_dns_table', function() {
    if ($('#install_on_subdomain').is(':checked')) {
      $('#require-subdomain-dns-container').removeClass('hidden');
      $('#require-dns-container').addClass('hidden');
    } else {
      $('#require-subdomain-dns-container').addClass('hidden');
      $('#require-dns-container').removeClass('hidden');
    }
  });

  define('render_require_dns_table', function(domain, app, is_domain) {
    var require_dns = (is_domain ? app.requires.dns : app.requires.subdomain_dns);

    return div({ id: (is_domain ? 'require-dns-container' : 'require-subdomain-dns-container'), 'class': (is_domain ? '' : 'hidden') },
      table({ 'class': 'require-dns-table hidden fancy-table' }, tbody(
      tr({ 'class': 'table-header' },
          th({ style: 'text-align: right; padding-right: 20px' }, 'Subdomain'),
          th({ style: 'padding: 0 20px' }, 'Type'),
          th({ style: 'width: 100%' }, 'Target')
      ),
      for_each(require_dns, function(dns) {
        return tr(
          td({ style: 'text-align: right; padding-right: 20px' }, (is_domain ? dns.subdomain : 'yoursubdomain'), span({ style: 'color: #aaa' }, dns.subdomain ? '.' : '', Domains.truncate_domain_name(domain))),
          td({ style: 'padding: 0 20px' }, dns.type.toUpperCase()),
          td(dns.priority, ' ', dns.content)
          //td(domain_has_record(domain_obj, dns) ? 'yes' : 'no')
        );
      })
    )));
  });

  define('show_needs_badger_nameservers_modal', function(app, domain_obj) {  
    show_modal(
      h1('First, install Badger DNS?'),
      div({ style: 'padding-top: 20px; text-align: right' }, 
        a({ 'class': 'myButton', href: curry(install_app_button_clicked, app, domain_obj) }, 'Install Badger Nameservers')
      )
    )
  });

  define('show_settings_modal_for_app', function(app_id, domain) {
    var app = Hasher.domain_apps[app_id];
    show_modal(
      h1('Settings for ', app.name),
      p("If you'd like to uninstall this application, click the uninstall button below."),
      div({ style: "text-align: right; margin-top: 30px" },
        a({ 
          'class': 'myButton', 
          href: function() {
            load_domain(domain, function(domain_obj) {
              remove_app_from_domain(app, domain_obj);
              hide_modal();
              $('#domain-menu-item-' + domain_obj.name.replace('.','-')).remove();
              set_route('#domains/' + domain_obj.name);
            });
          }
        }, 'Uninstall ', app.name)
      )
    )
  });
        
  define('domain_app_settings_button', function(app_id, domain) {
    return div({ style: 'float: right; margin-top: -44px' }, 
      a({ 'class': 'myButton small', href: curry(show_settings_modal_for_app, app_id, domain) }, 'Settings')
    );
  });
  



  ////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////




  define('register_domain_app', function(options) {
    if (!Hasher.domain_apps) Hasher.domain_apps = {};
    Hasher.domain_apps[options.id] = options;
  });
  
  define('app_is_installed_on_domain', function(app, domain_obj) {
    // dns? require badger nameservers
    // if (app.requires && app.requires.dns) app.requires.name_servers = ['ns1.badger.com','ns2.badger.com'];

    for (var key in app.requires) {
      switch(key) {
        case 'registrar':
          if (app.requires.registrar != domain_obj.current_registrar) return false;
        break;
        case 'name_servers':
          if (app.requires.name_servers[0] == '!=') {
            if ((domain_obj.name_servers||[]).join(',') == app.requires.name_servers.slice(1).join(',')) return false;
          } else {
            if ((domain_obj.name_servers||[]).join(',') != app.requires.name_servers.join(',')) return false;
          }
        break;
        case 'dns':
          var check_main_domain = true;
          for (var i=0; app.requires.dns && (i<app.requires.dns.length); i++) {
            if (!domain_has_record(domain_obj, app.requires.dns[i])) {
              check_main_domain = false;
              break;
            }
          }
          if (!check_main_domain) {
            if (!app.requires.subdomain_dns) return false;
            for (var i=0; (app.requires.subdomain_dns && i<app.requires.subdomain_dns.length); i++) {
              if (!domain_has_record(domain_obj, app.requires.subdomain_dns[i])) return false;
            }
          }
        break;
      }
    }
    
    return true;
  });
  

  define('domain_has_record', function(domain_obj, record) {
    for (var i=0; i < domain_obj.dns.length; i++) {
      var tmp_record = domain_obj.dns[i];

      var sanitize_domain = function(host) {
        var regex = new RegExp("\\.?" + domain_obj.name.replace('.','\\.') + '$');
        return (host || '').replace(regex,'').toLowerCase();
      };

      var content_matches;
      if (record.content && record.content.test) {//regexp
        content_matches = record.content.test((tmp_record.content||'').toLowerCase());
      } else {
        content_matches = !!((tmp_record.content||'').toLowerCase() == (record.content||'').toLowerCase());
      }
      
      var type_matches = !!((tmp_record.type||tmp_record.record_type||'').toLowerCase() == (record.type||record.record_type||'').toLowerCase());
      var subdomain_matches;
      if (record.subdomain && record.subdomain.test) {//regexp
        var subdomain = (tmp_record.subdomain||'').split('.')[0];
        subdomain_matches = record.subdomain.test(subdomain.toLowerCase());;
      } else {
        subdomain_matches = !!(sanitize_domain(tmp_record.subdomain) == sanitize_domain(record.subdomain));
      }
      var priority_matches = !!(parseInt(tmp_record.priority||'0') == parseInt(record.priority||'0'));
      
      if (content_matches && type_matches && subdomain_matches && priority_matches) return tmp_record;
    }
    
    return false;
  });

  define('install_app_on_domain', function(app, domain_obj, form_data, need_confirm) {
    var tmp_app = $.extend(true, {}, app);
    var dns_required = (form_data.install_on_subdomain ? app.requires.subdomain_dns : app.requires.dns)

    for_each(dns_required, function(record) {
      if (record.content_input)
        record.content = (form_data||{})[record.content_input];
      if (record.subdomain_input)
        // case of install on subdomain, use the subdomain user inputs instead when check whether the record is installed on domain
        record.subdomain = (form_data||{})[record.subdomain_input]
    });

    var apps_conflict = check_app_conflict(dns_required, domain_obj)
    if (apps_conflict.length > 0) {
      // callback to remove modal spin
      install_app_fail_notification(app, apps_conflict, domain_obj.name, form_data);
    } else {
      if (need_confirm) {
        install_confirm(app, domain_obj, form_data);
      } else {
        tmp_app.install_records_count = 0;
        for_each(dns_required, function(record) {
          if (!domain_has_record(domain_obj, record)) {
            var dns_fields = {
              record_type: record.type,
              priority: record.priority,
              subdomain: record.subdomain,
              ttl: 1800,
              content: record.content
            };

            Badger.addRecord(domain_obj.name, dns_fields, function(response) {
              // TODO: notify the user if error
              // if (response.meta.status == 'ok') {
              //   index(domain);
              // } else {
              //   $('#errors').empty().append(error_message(response));
              // }
              if (response.meta.status == 'ok') {
                tmp_app.install_records_count += 1;

                if (tmp_app.install_records_count == dns_required.length) {
                  // callback to remove modal spin
                  install_app_success(app, domain_obj);
                }
              } else {
                show_modal(div(
                  h1('Install DNS Records Error'),
                  error_message(response),
                  a({ href: hide_modal, 'class': 'myButton', value: "submit" }, "Close")
                ));
              }
            });
          } else {
            tmp_app.install_records_count += 1;
          }
        });
      }
    }
  });

  define('remove_app_from_domain', function(app, domain_obj, callback) {
    var temp_domain_obj = $.extend(true, {}, domain_obj);
    var dns_installed_on_domain = get_dns_of_installed_app(app, temp_domain_obj, false);
    var dns_installed_on_subdomain = app.requires.subdomain_dns ? get_dns_of_installed_app(app, temp_domain_obj, true) : [];
    var delete_records = dns_installed_on_domain.concat(dns_installed_on_subdomain);

    for_each(delete_records, function(record) {
      var server_record = domain_has_record(domain_obj, record)
      if (server_record) {
        console.log("DELETE RECORD")
        console.log(server_record);
        Badger.deleteRecord(domain_obj.name, server_record.id, function(response) {
          //TODO: notify user if error
          if (response.meta.status == 'ok') {
            if (callback) {
              if (app.delete_records_count)
                app.delete_records_count += 1;
              else
                app.delete_records_count = 1;

              if (app.delete_records_count == delete_records.length) {
                callback();
              }
            }
          }
        });
      }
    });
  });

  define('existing_conflict_record', function(installed_app_records, record, domain_name) {
    for (var i=0; i < installed_app_records.length; i++) {
      var tmp_record = installed_app_records[i];

      var sanitize_domain = function(host) {
        var regex = new RegExp("\\.?" + domain_name.replace('.','\\.') + '$');
        return (host || '').replace(regex,'').toLowerCase();
      };

      var type_matches = !!((tmp_record.type||tmp_record.record_type||'').toLowerCase() == (record.type||record.record_type||'').toLowerCase());
      var subdomain_matches = !!(sanitize_domain(tmp_record.subdomain) == sanitize_domain(record.subdomain));

      var content_matches = true;
      if (((record.type||record.record_type||'').toLowerCase() == 'txt') && type_matches && record.content) {
        content_matches = (((record.content || '').toLowerCase().indexOf('spf1') != -1 && (tmp_record.content||'').toLowerCase().indexOf('spf1') != -1) || ((record.content || '').toLowerCase().indexOf('spf2') != -1 && (tmp_record.content||'').toLowerCase().indexOf('spf2') != -1));
    }

      if (type_matches && subdomain_matches && content_matches) return tmp_record;
    }
    return false;
  });

  define('check_app_conflict', function(install_app_dns, domain) {
    var domain_obj = $.extend(true, {}, domain);
    var app_dns = get_dns_of_installed_apps_list(domain_obj);

    var conflict_app_keys = [];

    var user_custom_conflict_dns = []
    for (var index in domain_obj.dns) {
      if (existing_conflict_record(install_app_dns, domain_obj.dns[index], domain_obj.name)) {
        user_custom_conflict_dns.push(domain_obj.dns[index]);
      }
    }
    if (user_custom_conflict_dns.length > 0)
      conflict_app_keys.push({ id: 'user_dns', name: 'User Custom DNS', requires: { dns: user_custom_conflict_dns } });

    for_each(app_dns, function(app) {
      for (var index in install_app_dns) {
        if (existing_conflict_record(app.requires.dns, install_app_dns[index], domain_obj.name)) {
          conflict_app_keys.push(app);
          break;
        }
      }
    });

    return conflict_app_keys;
  });

  define('get_dns_of_installed_app', function(app, domain_obj, is_installed_on_subdomain) {
    var check_dns = (is_installed_on_subdomain ? app.requires.subdomain_dns : app.requires.dns);

    var results = [];
    // use while to get all same app installed on many subdomain
    while (app_is_installed_on_domain(app, domain_obj)) {
      var tempt = [];
      for (var i=0; i < check_dns.length; i++) {
        var found_record = domain_has_record(domain_obj, check_dns[i]);
        if (found_record) {
          tempt.push(found_record);
        }
      }
      if (tempt.length == check_dns.length) {
        results = results.concat(tempt);
        $.each(tempt, function() {
          var record = this;
          domain_obj.dns = $.grep(domain_obj.dns, function(value) {
            return value != record;
          });
        });
      } else
        break;
    }

    return results;
  });

  define('get_dns_of_installed_apps_list', function(domain_obj) {
    var app_dns=[];

    for (var key in Hasher.domain_apps) {
      var app = Hasher.domain_apps[key];
      if (app.requires && app.requires.dns && app_is_installed_on_domain(app, domain_obj)) {
        var app_result = $.extend(true, {}, app);
        app_result.requires.dns = [];

        // find app records installed on domain
        app_result.requires.dns = get_dns_of_installed_app(app, domain_obj, false);

        // find app records installed on subdomain
        if (app.requires.subdomain_dns) {
          var subdomain_records = get_dns_of_installed_app(app, domain_obj, true);
          app_result.requires.dns = app_result.requires.dns.concat(subdomain_records);
        }

        app_dns.push(app_result);
      }
    }

    return app_dns;
  });
}













// with (Hasher('Application')) {
// 
// }


//   var domain_obj = {
//     name: domain,
//     records: records
//   };
// 
//   console.log(data);
//   render({ target: elem },
// 
// Badger.getRecords(domain, function(records) {
//   console.log(domain_obj)


// with (Hasher('DomainApps','Application')) {
//   route({
//     '#domains/:domain/applications': 'show'
//   });
// 
//   define('show', function(domain) {
//    var apps = [
//      { 
//        name: 'Installed Applications',
//        apps: [
//          { name: 'DNS', icon: 'images/apps/badger.png' },
//          { name: 'Email Forwarding', icon: 'images/apps/badger.png' },
//          { name: 'URL Forwarding', icon: 'images/apps/badger.png' }
//        ]
//      },
// 
//      { 
//        name: 'Popular Applications',
//        apps: [
//          { name: 'Google Apps', icon: 'images/apps/googleapps.png' },
//           { name: 'Blogger', icon: 'images/apps/blogger.png' },
//           { name: 'Tumblr', icon: 'images/apps/tumblr.png' },
//           { name: 'Wordpress', icon: 'images/apps/wordpress.png' }
//        ]
//      },
// 
//      { 
//        name: 'Advanced Applications',
//        apps: [
//          { name: 'Public Whois', icon: 'images/apps/badger.png' },
//          { name: 'Custom Nameservers', icon: 'images/apps/badger.png' },
//        ]
//      }
//    ];
// 
//     // var apps = [
//     //  { 
//     //    name: 'Profiles',
//     //    apps: [
//     //      { name: 'About.me', icon: 'images/apps/aboutme.png' },
//     //      { name: 'Flavors.me', icon: 'images/apps/flavorsme.png' },
//     //      { name: 'Facebook', icon: 'images/apps/facebook.png' },
//     //      { name: 'Flickr', icon: 'images/apps/flickr.png' },
//     //      { name: 'Twitter', icon: 'images/apps/twitter.png' },
//     //      { name: 'Twitter', icon: 'images/apps/twitter.png' },
//     //      { name: 'Blogger', icon: 'images/apps/blogger.png' },
//     //      { name: 'Tumblr', icon: 'images/apps/tumblr.png' },
//     //      { name: 'Posterous', icon: 'images/apps/posterous.png' },
//     //      { name: 'Wordpress', icon: 'images/apps/wordpress.png' },
//     //      { name: 'App Engine', icon: 'images/apps/appengine.png' },
//     //      { name: 'Heroku', icon: 'images/apps/heroku.png' },
//     //      { name: 'Gmail', icon: 'images/apps/gmail.png' },
//     //      { name: 'Email Forwarder', icon: 'images/apps/badger.png' },
//     //      { name: 'Custom DNS', icon: 'images/apps/badger.png' },
//     //      { name: 'Public Whois', icon: 'images/apps/badger.png' },
//     //      { name: 'Website Forwarder', icon: 'images/apps/badger.png' },
//     //      { name: 'Google Docs', icon: 'images/apps/googledocs.png' }
//     //    ]
//     //  }
//     // ];
//  
//     render('show', domain, apps);
//     // 
//     // Badger.getDomain(domain, function(response) {
//     //   render('show_with_data', domain, response.data);
//     // });
//   });
// 
//  define('show_app_dialog', function(domain, app) {
//    var normalized_name = app.name.toLowerCase().replace(/[^a-z]/g,'_');
//     show_modal(DomainApps.() + normalized_name + '_install_modal', domain, app);
//  });
// 
//  // }
// 
// with (Hasher('DomainApps', 'Application')) { 
// 
// 
//  // define('show', function(domain) {
//  //   return div(
//  //     h1(domain),
//  //     p('Loading data for ' + domain + '...')
//  //   );
//  // });
//  // 
//  // define('show_with_data', function(domain, data) {
//  //   return div(
//  //     h1(domain),
//  //     dl({ 'class': 'fancy-dl' },
//  //       dt('Expires:'), dd(date(Date.parse(data.expires_on)).toDateString()), br(),
//  //       dt('Status: '), dd(data.status), br(),
//  //       dt('Registered:'), dd(date(Date.parse(data.registered_on)).toDateString(), (data.created_registrar ? ' via '+data.created_registrar : '')), br(),
//  //       dt('Previous Registrar: '), dd(data.losing_registrar), br(),
//  //       dt('Created At: '), dd(date(Date.parse(data.created_at)).toDateString()), br(),
//  //       dt('Updated At: '), dd(date(Date.parse(data.updated_at)).toDateString()), br(),
//  //       dt('Updated On: '), dd(date(Date.parse(data.updated_on)).toDateString())
//  //     )
//  //   );
//  // });
// }







// define('app_row', function(name) {
//   return div({ style: "padding: 20px 0; border-top: 1px solid #ccc; text-align: right" },
//     button({ 'class': 'myButton' }, "Install ", name)
//   );
// });

// route('#domains/:domain/google_apps', function(domain) {
//   render(
//     h1("Google Apps for ", domain),
//     p({ 'class': 'info-message' }, "By installing this application, you'll be able to login to Gmail via mail." + domain + " and create whatever@" + domain + " email addresses!"),
//     app_row('Gmail'),
//     app_row('Calendar'),
//     app_row('Chat')
//   );
// });



// with (Hasher('Model')) {
//   initializer(function() {
//     Hasher.models = {};
//   });
//   
//   define('find', function(key) {
//     alert('find: ' + key)
//     console.log(Hasher.models)
//     if (Hasher.models[key]) {
//       return Hasher.models[key];
//     } else {
//       Hasher.models[key] = {};
//     }
//   });
// }
// 
// with (Hasher('Domain', 'Model')) {
//   initializer(function() {
//     Hasher.active_domains_count_spans = [];
//   });
//   
//   define('span_active_domains_count', function() {
//     var elem = element('span', '--active_domains--');
//     Hasher.active_domains_count_spans.push(elem);
//     return elem;
//   });
// }



// after_filter('test', function() {
//   alert("check menu")
// });

// 
// with (Hasher('Model')) {
// }
// 
// with (Hasher('DomainApp', 'Model')) {
//   define('register', function(name, callback) {
//   });
// }
// 


// define('hide_modal', function() {
//   hide_modal();
// });
// 
// define('modal', function(callback) {
//   curry(show_modal, 'DNS.change_name_servers_modal', domain_info);
//   callback()
// });

// initializer(function() {
//   console.log("TODO: register GoogleApps as an app for a domain");
// 
// });

// this isnt quite right
// domain_initializer(function() {
//   console.log("TODO: read domain DNS and determine state of each ");
// })

// define('add_side_nav_to_domain', function(action) {
//   console.log('add_side_nav: ' + action);
// });



// with (Hasher('GoogleApps','DomainApp')) {
//   initializer(function() {
//     console.log('hi')
//   });
//   
//  // }


 // define('gmail_install_modal', function(domain, app) {
 //   return [
 //     h1('Gmail for Domains'),
 //     div("By installing this application, you'll be able to login to Gmail via mail." + domain + " and create whatever@" + domain + " email addresses!"),
 //     div({ style: "text-align: right" },
 //       button({ 'class': 'myButton' }, "Install " + app.name)
 //     )
 //   ];
 // });



// with (Hasher('BadgerDns', 'DomainApp')) {
//   add_side_nav('Badger DNS', '#/');
// 
//   register('badger_dns', function() {
//     
//   });
// }
// 
// with (Hasher('DomainAppController', 'Application')) {
//   
// }

