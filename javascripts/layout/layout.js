with (Hasher('Application')) {

  // define('update_sidebar', function() {
  //   if ($('#sidebar')) {
  //     var request_uri = get_route();
  //     check_if_domain_should_be_added_to_sidebar(request_uri);
  //     if (Badger.getAccessToken()) {
  //       update_my_domains_count();
  //       //update_invites_available_count();
  //     }
  //     update_sidebar_with_correct_actives(request_uri);
  //     OutlineFix.fix_ie_7();
  //   }
  // 
  //   // Fix placeholder does not work in IE
  //   Placeholder.fix_ie();
  // })
  // 
  // after_filter('update_sidebar', update_sidebar);


  // define('update_sidebar_with_correct_actives', function(request_uri) {
  //   if (!request_uri) request_uri = get_route();
  //   if (request_uri.indexOf("filter_domains") != -1) request_uri = request_uri.replace('grid', 'list');
  //   if (request_uri.indexOf("#blogs/") == 0) request_uri = '#blogs';
  //   if (request_uri.indexOf("#tickets/") == 0) request_uri = '#tickets';
  //   if (request_uri.indexOf("#knowledge_center/") != -1) request_uri = '#knowledge_center';
  // 
  //   // select active link and expand parent
  //   $('#sidebar ul').removeClass('expanded');
  //   $('#sidebar a').removeClass('active');
  //   $('#sidebar li').removeClass('active');
  //   if (request_uri == '#search') {
  //     $('#form-search').addClass('active');
  //   } else {
  //     $('#form-search').removeClass('active');
  //     var links = $('#sidebar a[href="' + request_uri + '"]').addClass('active');
  //     var parent_li = links.parent();
  //     parent_li.addClass("active");
  //     if (!parent_li.parent().is('#menu')) parent_li = parent_li.parent().parent();
  //     parent_li.find('ul').addClass('expanded');
  //   }
  // });

  define('update_my_domains_count', function(refresh) {
    if (!Badger.getAccessToken()) return;
    if (refresh) BadgerCache.flush('domains');
    
    BadgerCache.getDomains(function(results) {
      var count = results.length;
      if (count > 0) {
        $('#my-domains-count').html(" (" + count + ")");
        $('#all-my-domains-h1').html(" (" + count + ")");
        $('#user-nav-domains').html(count + " Domains");
      } else {
        $('#user-nav-domains').html("Domains");
      }
    });
  });

  after_filter('update_my_domains_count', update_my_domains_count);

  // define('update_invites_available_count', function() {
  //   BadgerCache.getAccountInfo(function(response) {
  //     $('#nav-my-account ul li#invites_available #invite_available_count').html(' (' + response.data.invites_available + ')')
  //     if (response.data.invites_available > 0) {
  //       $('#nav-my-account ul li#invites_available').removeClass('hidden');
  //     } else {
  //       BadgerCache.getInviteStatus(function(response) {
  //         if (response.data.length > 0)
  //           $('#nav-my-account ul li#invites_available').removeClass('hidden');
  //       });
  //     }
  //   });
  // });

  define('check_if_domain_should_be_added_to_sidebar', function(request_uri) {
    if (!request_uri) request_uri = get_route();
    var domain = (request_uri.match(/#domains\/([^\/]+)/) || [])[1];
    if (domain) {
      if ($('#menu #domain-menu-item-' + domain.replace('.','-')).length == 0) {
        $('#menu .domain-menu-item').slice(4).remove();
        $('#nav-help-and-support').after(domain_menu_item(domain));
      }
	    if (request_uri.indexOf("filter_domains/all") != -1) request_uri = '#';
      else if (request_uri.indexOf("filter_domains") != -1) request_uri = request_uri.replace('grid', 'list');
    }
  });

  layout('default_layout', function(yield) {
    var ie_browser = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
    return [
      header(),

      div({ id: 'wrapper' },
        div({ id: 'main', 'class': 'whitebg' },
          div({ 'id': 'content' }, 
            yield
          )
        )
      ),
      
      footer(),
      
      chatbar()
    ];
  });



  define('chatbar', function() {
    return div({ 'class': 'closed', id: 'chatbar' },
      a({ href: Chat.hide_chat, 'class': 'close-button' }, 'X'),
      a({ href: Chat.minimize_chat, 'class': 'close-button min-button' }, '–'),
      h1({ onclick: Chat.show_chat }, 'Badger Chatroom'),
      div({ "class": "content" })
    );
  });

  define('header', function() {
    return div({ id: 'header' },
      div({ 'class': 'inner' },
        h1({ id: 'logo' }, a({ href: '#welcome'}, 'badger')),

        search_box(),
      
        Badger.getAccessToken() ? 
          user_nav()
        : div({ id: 'user-nav' },
          span(a({ href: '#account/login' }, 'Login')),
          a({ href: '#account/create' }, 'Create Account')
        )
      )
    );
  });
  
  define('footer', function() {
    return div({ id: 'footer' },
      div({ 'class': 'outer' },
        div({ 'class': 'inner' },
          div({ 'class': "col" },
            h2('Company'),
            ul(
              li(a({ href: "#blogs" }, 'Blog')),
              li(a({ href: "#terms_of_service" }, 'Terms of Service')),
    					li(a({ href: "http://www.icann.org/en/registrars/registrant-rights-responsibilities-en.htm", target: "_blank" }, 'ICANN Registrant Rights')),
              li(a({ href: "https://whois.badger.com/", target: '_blank' }, 'Whois Lookup'))
            )
          ),
          div({ 'class': "col" },
            h2('Help and Support'),
            ul(
              li(a({ href: "#contact_us" }, 'Contact Us')),
              li(a({ href: "#faqs" }, 'Frequently Asked Questions')),
              li(a({ href: "#knowledge_center" }, 'Knowledge Center')),
              li(a({ href: 'https://github.com/badger/frontend', target: '_blank' }, 'API Docs for Developers'))
            )
          ),
          div({ 'class': "col" },
            h2('Connect With Us'),
            ul(
              li(a({ href: "mailto:support@badger.com" }, 'support@badger.com')),
              li(a({ href: 'tel:+1-415-787-5050' }, '+1-415-787-5050' )),
              li(
                a({ href: "https://twitter.com/badger", target: "_blank" }, 'Twitter'),
                ' / ',
                a({ href: "https://www.facebook.com/BadgerDotCom", target: "_blank" }, 'Facebook'),
                ' / ',
                a({ href: "irc://irc.freenode.net/badger", target: "_blank" }, 'IRC')
              )
            )
          ),
          div({ 'class': "col" },
            h2('Accreditations'),
            img({ src: 'images/icann.png' })
          ),

          div({ style: 'clear: both'})
        )
      )
    )
  });


  define('user_nav', function() {
    var user_nav = div({ id: 'user-nav' },
      a({ href: Badger.logout }, 'Logout')
    );
    
    BadgerCache.getAccountInfo(function(response) {
      //$(user_nav).prepend(span(a({ href: '#account/settings'}, response.data.name)));
      $(user_nav).prepend(span({ id: 'use_nav_name' }, a({ href: '#account' }, response.data.name)));
      //$(user_nav).prepend(span({ id: 'user_nav_invites_available', 'class': response.data.invites_available <= 0 ? 'hidden' : '' }, a({ href: '#invites' }, response.data.invites_available + ' Invites')));
      $(user_nav).prepend(span(a({ href: '#account/billing', id: 'user_nav_credits' }, 'Credits')));
      $(user_nav).prepend(span(a({ href: '#filter_domains/all/list', id: 'user-nav-domains' }, 'Domains')));
      update_credits();
      //update_my_domains_count();
    });

    return user_nav;
  });

  define('update_credits', function(refresh) {
    if (refresh) BadgerCache.flush('account_info');
    BadgerCache.getAccountInfo(function(response) {
      $('#user_nav_credits').html(response.data.domain_credits == 1 ? '1 Credit' : response.data.domain_credits + ' Credits');
    });
  });

  define('update_account_name', function() {
    BadgerCache.flush('account_info');
    BadgerCache.getAccountInfo(function(response) {
      $('#use_nav_name').html(response.data.name);
    });
  });

  define('update_invites_available', function(refresh) {
    if (refresh) BadgerCache.flush('account_info');
    BadgerCache.getAccountInfo(function(response) {
      $('#user_nav_invites_available a').html(response.data.invites_available + ' Invites');
      if (response.data.invites_available > 0)
        $('#user_nav_invites_available').removeClass('hidden');
      else
        $('#user_nav_invites_available').addClass('hidden');
    });
  });

  define('search_box', function(domain) {
    return form({ id: "form-search", action: Search.search_box_changed },
      input({ id: 'form-search-input', type: 'text', value: '', placeholder: 'Search for domains', events: {
        click: Search.set_search_route,
        change: Search.search_box_changed,
        keyup: Search.search_box_changed,
        keypress: function(e) {
          if (e.charCode)
            code = e.charCode
          else // In IE charCode is Undefined, use keyCode
            code = e.keyCode
          // Hack to make it work on Firefox
          // In Firefox, charCode of Arrow and Delete key is 0, keyCode is 37, 38, 39, 40, 8
          if (!([37, 38, 39, 40, 8].indexOf(parseInt(e.keyCode)) != -1 && e.charCode == 0) && /[^a-zA-Z0-9\-\.]/.test(String.fromCharCode(code))) stop_event(e);
        }
      }})
    );
  });




  ////////////////
  // dom helpers
  ////////////////
  
  define('country_options', function(selected_country) {
    countries = [["AF", "Afghanistan"],["AX", "Åland"],["AL", "Albania"],["DZ", "Algeria"],["AS", "American Samoa"],["AD", "Andorra"],["AO", "Angola"],["AI", "Anguilla"],["AQ", "Antarctica"],["AG", "Antigua and Barbuda"],["AR", "Argentina"],["AM", "Armenia"],["AW", "Aruba"],["AU", "Australia"],["AT", "Austria"],["AZ", "Azerbaijan"],["BS", "Bahamas"],["BH", "Bahrain"],["BD", "Bangladesh"],["BB", "Barbados"],["BY", "Belarus"],["BE", "Belgium"],["BZ", "Belize"],["BJ", "Benin"],["BM", "Bermuda"],["BT", "Bhutan"],["BO", "Bolivia"],["BA", "Bosnia and Herzegovina"],["BW", "Botswana"],["BV", "Bouvet Island"],["BR", "Brazil"],["IO", "British Indian Ocean Territory"],["BN", "Brunei Darussalam"],["BG", "Bulgaria"],["BF", "Burkina Faso"],["BI", "Burundi"],["KH", "Cambodia"],["CM", "Cameroon"],["CA", "Canada"],["CV", "Cape Verde"],["KY", "Cayman Islands"],["CF", "Central African Republic"],["TD", "Chad"],["CL", "Chile"],["CN", "China"],["CX", "Christmas Island"],["CC", "Cocos (Keeling) Islands"],["CO", "Colombia"],["KM", "Comoros"],["CG", "Congo (Brazzaville)"],["CD", "Congo (Kinshasa)"],["CK", "Cook Islands"],["CR", "Costa Rica"],["CI", "Côte d'Ivoire"],["HR", "Croatia"],["CU", "Cuba"],["CY", "Cyprus"],["CZ", "Czech Republic"],["DK", "Denmark"],["DJ", "Djibouti"],["DM", "Dominica"],["DO", "Dominican Republic"],["EC", "Ecuador"],["EG", "Egypt"],["SV", "El Salvador"],["GQ", "Equatorial Guinea"],["ER", "Eritrea"],["EE", "Estonia"],["ET", "Ethiopia"],["FK", "Falkland Islands"],["FO", "Faroe Islands"],["FJ", "Fiji"],["FI", "Finland"],["FR", "France"],["GF", "French Guiana"],["PF", "French Polynesia"],["TF", "French Southern Lands"],["GA", "Gabon"],["GM", "Gambia"],["GE", "Georgia"],["DE", "Germany"],["GH", "Ghana"],["GI", "Gibraltar"],["GR", "Greece"],["GL", "Greenland"],["GD", "Grenada"],["GP", "Guadeloupe"],["GU", "Guam"],["GT", "Guatemala"],["GG", "Guernsey"],["GN", "Guinea"],["GW", "Guinea-Bissau"],["GY", "Guyana"],["HT", "Haiti"],["HM", "Heard and McDonald Islands"],["HN", "Honduras"],["HK", "Hong Kong"],["HU", "Hungary"],["IS", "Iceland"],["IN", "India"],["ID", "Indonesia"],["IR", "Iran"],["IQ", "Iraq"],["IE", "Ireland"],["IM", "Isle of Man"],["IL", "Israel"],["IT", "Italy"],["JM", "Jamaica"],["JP", "Japan"],["JE", "Jersey"],["JO", "Jordan"],["KZ", "Kazakhstan"],["KE", "Kenya"],["KI", "Kiribati"],["KP", "Korea, North"],["KR", "Korea, South"],["KW", "Kuwait"],["KG", "Kyrgyzstan"],["LA", "Laos"],["LV", "Latvia"],["LB", "Lebanon"],["LS", "Lesotho"],["LR", "Liberia"],["LY", "Libya"],["LI", "Liechtenstein"],["LT", "Lithuania"],["LU", "Luxembourg"],["MO", "Macau"],["MK", "Macedonia"],["MG", "Madagascar"],["MW", "Malawi"],["MY", "Malaysia"],["MV", "Maldives"],["ML", "Mali"],["MT", "Malta"],["MH", "Marshall Islands"],["MQ", "Martinique"],["MR", "Mauritania"],["MU", "Mauritius"],["YT", "Mayotte"],["MX", "Mexico"],["FM", "Micronesia"],["MD", "Moldova"],["MC", "Monaco"],["MN", "Mongolia"],["ME", "Montenegro"],["MS", "Montserrat"],["MA", "Morocco"],["MZ", "Mozambique"],["MM", "Myanmar"],["NA", "Namibia"],["NR", "Nauru"],["NP", "Nepal"],["NL", "Netherlands"],["AN", "Netherlands Antilles"],["NC", "New Caledonia"],["NZ", "New Zealand"],["NI", "Nicaragua"],["NE", "Niger"],["NG", "Nigeria"],["NU", "Niue"],["NF", "Norfolk Island"],["MP", "Northern Mariana Islands"],["NO", "Norway"],["OM", "Oman"],["PK", "Pakistan"],["PW", "Palau"],["PS", "Palestine"],["PA", "Panama"],["PG", "Papua New Guinea"],["PY", "Paraguay"],["PE", "Peru"],["PH", "Philippines"],["PN", "Pitcairn"],["PL", "Poland"],["PT", "Portugal"],["PR", "Puerto Rico"],["QA", "Qatar"],["RE", "Reunion"],["RO", "Romania"],["RU", "Russian Federation"],["RW", "Rwanda"],["BL", "Saint Barthélemy"],["SH", "Saint Helena"],["KN", "Saint Kitts and Nevis"],["LC", "Saint Lucia"],["MF", "Saint Martin (French part)"],["PM", "Saint Pierre and Miquelon"],["VC", "Saint Vincent and the Grenadines"],["WS", "Samoa"],["SM", "San Marino"],["ST", "Sao Tome and Principe"],["SA", "Saudi Arabia"],["SN", "Senegal"],["RS", "Serbia"],["SC", "Seychelles"],["SL", "Sierra Leone"],["SG", "Singapore"],["SK", "Slovakia"],["SI", "Slovenia"],["SB", "Solomon Islands"],["SO", "Somalia"],["ZA", "South Africa"],["GS", "South Georgia and South Sandwich Islands"],["ES", "Spain"],["LK", "Sri Lanka"],["SD", "Sudan"],["SR", "Suriname"],["SJ", "Svalbard and Jan Mayen Islands"],["SZ", "Swaziland"],["SE", "Sweden"],["CH", "Switzerland"],["SY", "Syria"],["TW", "Taiwan"],["TJ", "Tajikistan"],["TZ", "Tanzania"],["TH", "Thailand"],["TL", "Timor-Leste"],["TG", "Togo"],["TK", "Tokelau"],["TO", "Tonga"],["TT", "Trinidad and Tobago"],["TN", "Tunisia"],["TR", "Turkey"],["TM", "Turkmenistan"],["TC", "Turks and Caicos Islands"],["TV", "Tuvalu"],["UG", "Uganda"],["UA", "Ukraine"],["AE", "United Arab Emirates"],["GB", "United Kingdom"],["UM", "United States Minor Outlying Islands"],["US", "United States of America"],["UY", "Uruguay"],["UZ", "Uzbekistan"],["VU", "Vanuatu"],["VA", "Vatican City"],["VE", "Venezuela"],["VN", "Vietnam"],["VG", "Virgin Islands, British"],["VI", "Virgin Islands, U.S."],["WF", "Wallis and Futuna Islands"],["EH", "Western Sahara"],["YE", "Yemen"],["ZM", "Zambia"],["ZW", "Zimbabwe"]];
    return [
      option({ value: "AU" }, "Australia"),
      option({ value: "CA" }, "Canada"),
      option({ value: "GB" }, "United Kingdom"),
      option({ value: "US" }, "United States of America"),
      option({ disabled: 'disabled' },''),

      countries.map(function(country) {
        var opts = { value: country[0] };
        if (selected_country == country[0]) opts.selected = 'selected';
        return option(opts, country[1]);
      })
    ];
  });
  
  define('error_message', function(response) {
    return div({ 'class': 'error-message' },
			div(
			  response.data ? [
  				response.data.message,
  				!response.data.errors ? "" : ": " + response.data.errors.map(function(error) { return error.reason ? error.reason : error.field.replace(/_/g, ' ').capitalize_first() + " " + error.code.replace(/_/g, ' ');}).join(', ')
			  ] : arguments
			)
    )
  });

  define('success_message', function(response) {
    return div({ 'class': 'success-message' },
			div( response.data ? response.data.message : arguments )
    )
  });

  define('info_message', function(response) {
    return div({ 'class': 'info-message' },
			div( response.data ? response.data.message : arguments )
    )
  });
  
  define('spinner', function(text) {
    return div({ style: "text-align:center" },
      img({ src: "images/spinner.gif" }),
      br(),
      span({ style: "font-style: italic" }, text)
    );
  });


  //////////////
  // left nav
  //////////////

  // define('left_nav', function() {
  //   var badger_menu_items = [
  //     li({ 'class': "blog" }, a({ href: "#blogs" }, 'OUR BLOG')),
  //     li({ 'class': "faq" }, a({ href: "#faqs" }, 'FAQS')),
  //     li({ 'class': "knowledge-center" }, a({ href: "#knowledge_center" }, 'KNOWLEDGE CENTER')),
  //     li({ 'class': "contact-us" }, a({ href: "#contact_us" }, 'CONTACT US'))
  //   ];
  //   
  //   return ul({ id: 'menu' },
  //     Badger.getAccessToken() ? [
  //       li({ id: 'nav-my-domains' },
  //         a({ href: "#filter_domains/all/list" }, span(span('MY DOMAINS'), span({ id: 'my-domains-count' }))),
  //         ul(
  //           li({ 'class': "transfer"}, a({ href: "#domain-transfers" }, 'TRANSFERS')),
  //           li({ 'class': "expiring-soon"}, a({ href: "#filter_domains/expiringsoon/list" }, 'EXPIRING SOON'))
  //         )
  //       ),
  // 
  //       li({ id: 'nav-my-account' },
  //         a({ href: "#account" }, 'MY ACCOUNT'),
  //         my_account_nav()
  //       ),
  // 
  //       li({ id: 'nav-help-and-support' },
  //         a({ href: "#welcome" }, 'BADGER.COM'),
  //         ul(badger_menu_items)
  //       )
  //     ] : [
  //       li(a({ href: "#welcome" }, 'BADGER.COM')),
  //       badger_menu_items
  //     ]
  // 
  //   );
  // });
  
  // define('badger_menu_items', function() {
  //   return ;
  // });

  // define('my_account_nav', function() {
  //   var nav = ul(
  //     li({ 'class': "support-ticket" }, a({ href: "#tickets" }, 'SUPPORT TICKETS')),
  //     li({ 'class': "whois-pro" }, a({ href: "#account/profiles" }, 'WHOIS PROFILES')),
  //     li({ 'class': "credit-billing" }, a({ href: "#account/billing" }, 'CREDITS & BILLING')),
  //      li({ 'class': "linked-account" }, a({ href: "#linked_accounts" }, 'LINKED ACCOUNTS')),
  //     li({ 'class': "send-invite hidden", id : 'invites_available'}, a({ href: "#invites" }, span('SEND INVITES'), span({ id: 'invite_available_count' })))
  //   );
  // 
  //   return nav;
  // });

  // define('domain_menu_item', function(domain) {
  //   //var domain = Domain.find(domain);
  //   var app_list = ul();
  // 
  //   load_domain(domain, function(domain_obj) {
  //     if (domain_obj.current_registrar == 'Unknown') {
  //       var timeout = setTimeout(function() {
  //         Badger.getDomain(domain_obj.name, function(response) {
  //           clearTimeout(timeout);
  //           domain_menu_item(domain);
  //         });
  //       }, 1000);
  //     } else if (domain_obj.current_registrar) {
  //       for (var key in Hasher.domain_apps) {
  //         if (DomainApps.app_is_installed_on_domain(Hasher.domain_apps[key], domain_obj) && Hasher.domain_apps[key].menu_item) {
  //           css_class = Hasher.domain_apps[key].menu_item.css_class || "website"
  //           app_list.appendChild(
  //             li({ 'class':  css_class },
  //               a({
  //                 href: Hasher.domain_apps[key].menu_item.href.replace(/:domain/, domain)
  //               }, Hasher.domain_apps[key].menu_item.text)
  //             )
  //           );
  //         }
  //       }
  // 
  //       update_sidebar_with_correct_actives(get_route());
  //     }
  //   });
  // 
  //   return li({ id: 'domain-menu-item-' + domain.replace('.','-'), 'class': 'domain-menu-item' },
  //     a({ href: "#domains/" + domain }, div({ 'class': 'long-domain-name' }, domain.toUpperCase())),
  //     app_list
  //   );
  // });

}


// domain.dns.each()
//   var items = [];
//   for (var key in Hasher.domain_apps) {
//     if (Hasher.domain_apps[key].is_installed(domain) && Hasher.domain_apps[key].menu_item) {
//       Hasher.domain_apps[key].menu_item
//       items.push(
//         li({ 'class': "website" },
//           a({
//             href: Hasher.domain_apps[key].menu_item.href.replace(/:domain/, domain)
//           }, Hasher.domain_apps[key].menu_item.text)
//         )
//       );
//     }
//   }
//   return items;

//     li({ 'class': "email" }, a({ href: "#domains/" + domain + "/whois" }, 'WHOIS & PRIVACY'))
//
//     ul(
//       li({ 'class': "email" }, a({ href: "#domains/" + domain + "/dns" }, 'DNS')),
//       li({ 'class': "email" }, a({ href: "#domains/" + domain + "/whois" }, 'WHOIS & PRIVACY'))
// // li({ 'class': "email" }, a({ href: "#domains/" + domain + "/email_forwards" }, 'EMAIL FORWARDS')),
// // li({ 'class': "email" }, a({ href: "#domains/" + domain + "/web_forwards" }, 'WEB FORWARDS'))
//       //li({ 'class': "email" }, a({ href: "#domains/" + domain + "/whois" }, 'TRANSFER'))
//     )

