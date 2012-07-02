with (Hasher('Blogger', 'DomainApps')) {

  var app = register_domain_app({
    id: 'badger_blogger',
    name: 'Blogger',
    icon: 'images/apps/blogger.png',
    menu_item: { text: 'Blogger', href: '#domains/:domain/apps/blogger' },
    requires: {
      dns: [
        { type: 'a', content: "216.239.32.21" },
        { type: 'a', content: "216.239.34.21" },
        { type: 'a', content: "216.239.36.21" },
        { type: 'a', content: "216.239.38.21" },
        { type: 'cname', subdomain: 'www', content: 'ghs.google.com' }
      ],
      subdomain_dns: [
        { type: 'cname', subdomain: /[a-zA-Z0-9_-]+/, content: "ghs.google.com", subdomain_input: "subdomain" }
      ]
    },

    install_screen: function(app, domain_obj) {
      return div(
        p('Blogger is a free weblog publishing tool from Google for sharing text, photos and video.'),
        p('Install this app to point your domain to your Blogger account.'),
        form({ action: curry(install_app_button_clicked, app, domain_obj) },
          show_required_dns(app, domain_obj),
          input({ 'class': 'myButton', type: 'submit', value: 'Install Blogger' })
        )
      );
    }
  });

  route('#domains/:domain/apps/blogger', function(domain) {
    with_domain_nav_for_app(domain, app, function(nav_table) {
      render(
        h1_for_domain(domain, 'Blogger'),

        nav_table(
          domain_app_settings_button('badger_blogger', domain),
              
          p("Blogger DNS settings have successfully been installed into Badger DNS."),
          div(
            span("Last steps before you're all set:"), br(),
            span("1. Log in to ", a({ href: "http://www.blogger.com", target: '_blank' }, "Blogger"), "."), br(),
            span("2. Go to the ", strong("Settings|Basic"), " tab."), br(),
            span("3. Under ", strong("Publishing"), ", click ", strong("+ Add a custom domain"), "."), br(),
            span("4. Click on ", strong("Switch to advanced settings"), "."), br(),
            span("5. Enter your domain, " + domain + ", into the box provided and click ", strong("Save"), "."), br()
          ),
          p("Once everything is set up and saved, your Blogger URL will automatically redirect to " + domain + "."),
          p (span("For more information, ", a({ href: 'http://support.google.com/blogger/bin/static.py?hl=en&ts=1233381&page=ts.cs', target: '_blank' }, 'click here'), "."))
        )
      );
    });
  });

};