with (Hasher('DomainShow','DomainApps')) {

  route('#domains/:domain', function(domain) {
    var content_div = div('Loading...');
    render(
      h1({ 'class': 'long-domain-name' }, domain),
      content_div
    );

    Badger.getDomain(domain, curry(handle_get_domain_response, content_div, domain));
  });

  define('handle_get_domain_response', function(content_div, domain, response) {
    var domain_obj = response.data;
    
    if (response.meta.status == 'ok') {
      if (!domain_obj.current_registrar) {
        if (domain_obj.can_register) {
          render({ into: content_div },
            "This domain is not currently registered!",br(),br(),
            a({ 'class': 'myButton small', href: curry(Register.show, domain_obj.name) }, 'Register ', domain_obj.name)
          );
        } else {
          render({ into: content_div },
            div("This domain is not currently registered! Unfortunately, we do not support this top level domain quite yet. Check back later!")
            // TODO add some sort of way to watch the domain here. Make these messages way prettier. --- CAB
          );
        }
      } else if (domain_obj.current_registrar == 'Unknown') {
        // if it's "unknown", it was probably just added and we're still loading info for it... try again in 1 second
        var timeout = setTimeout(function() {
          Badger.getDomain(domain_obj.name, curry(handle_get_domain_response, content_div, domain));
        }, 1000);
      } else {
        render({ into: content_div }, 
          domain_status_description(domain_obj),
          render_all_application_icons(domain_obj)
        );
      }
    } else {
      render({ into: content_div },
        error_message("Oops, we're having a problem finding any information for: " + domain)
      );
    }
  });

  define('domain_status_description', function(domain_obj) {
    if ((domain_obj.permissions_for_person || []).indexOf('show_private_data') >= 0) {
      return p('This domain is VALID and will auto-renew for 1 Credit on ', new Date(Date.parse(domain_obj.expires_at)).toDateString(), '.');
    } else if ((domain_obj.permissions_for_person || []).indexOf('linked_account') >=0) {
      return p('This domain is currently registered to your linked account on ' + domain_obj.current_registrar);
    } else if ((domain_obj.permissions_for_person || []).indexOf('pending_transfer') >=0) {
      switch (domain_obj.transfer_status)
      {
        case 'needs_unlock':
          return [
            p('This domain is currently in pending transfer. To continue, please unlock this domain.',
              a({ href: 'https://www.badger.com/#knowledge_center/3-Unlocking-Your-Domain' }, '(?)')),
            a({ 'class': 'myButton myButton-small', href: curry(retry_transfer, domain_obj.name) }, 'Retry')
          ];
        case 'needs_privacy_disabled':
          return [
            p('This domain is currently in pending transfer. To continue, please disable this domain privacy.',
              a({ href: 'https://www.badger.com/#knowledge_center/3-Disable-Privacy_of-Your-Domain' }, '(?)')),
            a({ 'class': 'myButton myButton-small', href: curry(retry_transfer, domain_obj.name) }, 'Retry')
          ];
        case 'needs_auth_code':
          return [
            p('This domain is currently in pending transfer. To continue, please input the authcode here.',
              a({ href: 'https://www.badger.com/#knowledge_center/3-Unlocking-Your-GoDaddy-Domain' }, '(?)')),
            form({ action: curry(retry_transfer, domain_obj.name) },
              input({ name: 'auth_code', placeholder: 'authcode' }),
              input({ 'class': 'myButton myButton-small', type: 'submit', value: 'Retry' })
            )
          ];
        case 'needs_transfer_request':
          return [
            p('This domain is currently in pending transfer and need a transfer request.',
              a({ href: 'https://www.badger.com/#knowledge_center/3-Domain-Transfer-Request' }, '(?)')),
            a({ 'class': 'myButton myButton-small', href: curry(retry_transfer, domain_obj.name) }, 'Retry')
          ];
        case 'transfer_requested':
          return [
            p('This domain is currently in pending transfer. You will need to approve this transfer manually at your current registrar. Or you can wait 5 days and the transfer will automatically go through.',
              a({ href: 'https://www.badger.com/#knowledge_center/9-Manually-Approving-a-Transfer-on-GoDaddy' }, '(?)')),
            a({ 'class': 'myButton myButton-small', href: curry(retry_transfer, domain_obj.name) }, 'Retry')
          ];
      }
    } else {
      return p('This domain is currently registered to somebody else on ' + domain_obj.current_registrar);
    }
  });

  define('retry_transfer', function(domain_name, form_data){
    var params = { retry: true, name: domain_name };
    if (form_data) {
      params.auth_code = form_data.auth_code;
    }
    Badger.transferDomain(params, function(response) {
      if (form_data.auth_code && (response.data.transfer_status == 'needs_auth_code')) {
        alert('Invalid AuthCode');
      }
      set_route(get_route());
    });
  });

  define('render_all_application_icons', function(domain_obj) {
    var modify_dns = $.inArray("modify_dns", domain_obj.permissions_for_person || []) >= 0;
    
    var installed_apps = div();
    var available_apps = div({ id: "available-apps" });

    for (var key in Hasher.domain_apps) {
      var app = Hasher.domain_apps[key];
      if (app.menu_item) {
        var href;
        var target;
        if (app_is_installed_on_domain(app, domain_obj)) {
          href = app.menu_item.href.replace(/:domain/, domain_obj.name);
          target = installed_apps;
        } else {
          if ((app.id == 'badger_dns') || (app.id == 'remote_dns')) {
            href = curry(DnsApp.change_name_servers_modal, domain_obj);
          } else {
            href = curry(show_modal_install_app, app, domain_obj);
          }
          target = available_apps;
        }
        target.appendChild(
          a({ 'class': 'app_store_container', href: href },
            span({ 'class': 'app_store_icon', style: 'background-image: url(' + ((app.icon && app.icon.call ? app.icon.call(null, domain_obj) : app.icon) || 'images/apps/badger.png') + ')' } ),
            span({ style: 'text-align: center; font-weight: bold' }, (app.name.call ? app.name.call(null, domain_obj) : app.name))
          )
        );
        // add a clear every six icons
        if (target.childNodes.length % 7 == 6) target.appendChild(div({ style: 'clear: left ' }));
      }
    }

    return [
      h2({ style: 'border-bottom: 1px solid #888; padding-bottom: 6px' }, 'Installed Applications'),
      installed_apps,
      div({ style: 'clear: both '}),
      modify_dns ? [
        h2({ style: 'border-bottom: 1px solid #888; padding-bottom: 6px' }, 'Available Applications'),
        available_apps
      ] : [],
      div({ style: 'clear: both '})
    ];
  });
  
}
