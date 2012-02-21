with (Hasher('LinkedAccounts','Application')) {

	route('#linked_accounts', function() {
		var target_div = div("Loading...");
		
		render(
			div(
				h1('Linked Accounts'),
				target_div
			)
		)
				
		Badger.getLinkedAccounts(function(response) {
			render({ target: target_div },
				(response.data || []).length == 0 ? [
					div({ 'class': 'info-message', style: "margin: 25px 0" },
					  h2({ style: 'margin: 0 0 15px'}, "You have not linked any accounts yet, why not add one now?"), 
					  a({ 'class': "myButton large", href: curry(add_linked_accounts_modal, response.data) }, "Add A Linked Account")
          ),
				] : [
          div({ style: "float: right; margin-top: -44px" },
            a({ 'class': "myButton small", href: curry(add_linked_accounts_modal, response.data) }, "Add Linked Account")
          ),
				  linked_accounts_table(response.data)
				]
			);
		});
	});
	
	define('add_linked_accounts_modal', function(accounts) {
		show_modal(
			h1('Add Linked Account'),
			table({ 'class': "fancy-table" }, tbody(
			  show_account_link_rows(accounts)
			))
		);
	});
	
	define('linked_accounts_table', function(accounts) {
		return table({ id: "accounts-table", 'class': "fancy-table" }, tbody(
			// if the user has not linked any accounts yet, we want to show all of the accounts that they can link immediately.
			(accounts.length == 0 ? [
				show_account_link_rows(accounts)
			] : [
				(accounts || []).map(function(account) {
					if (account.site == "twitter") {
						var row = linked_accounts_table_row("Twitter",
						  div({ id: ("twitter-" + account.id), style: "text-align: center" },
							  img({ src: "images/ajax-loader.gif" })
						  )
						);
						
						update_linked_account_row_handler(account);
						
						return row;
					} else if (account.site == "facebook") {
						
						var row = linked_accounts_table_row("Facebook",
						  div({ id: ("facebook-" + account.id), style: "text-align: center" },
							  img({ src: "images/ajax-loader.gif" })
						  )
						);
						
						update_linked_account_row_handler(account);
						
						return row;
						
					} else if (account.site == "godaddy" || account.site == "networksolutions") {
					  var name = 'Unknown';
					  var status = 'Unknown';
  					var error = false;
  					switch (account.status) {
  					  case 'synced':
  					    status = 'Linked'
  					    break;
  					  case 'error_auth':
  					    status = span({ 'class': 'error-red' }, 'Login Failure')
  					    error = true;
  					    break
  					}
  					switch (account.site) {
  					  case 'godaddy':
  					    name = 'Go Daddy, Inc.';
  					    break;
  					  case 'networksolutions':
    				    name = 'Network Solutions LLC';
    				    break;
  					}
  					
					  return linked_accounts_table_row(name, 
			  	    div({ id: (account.site + "-" + account.id) },
			  	      div({ 'class': error ? "error-message" : "status-message", style: "position: relative; text-align: right; margin: 5px auto 5px auto; height: 95px; width: 370px; padding: 10px;" },
                  h3("Status: ", status),
                  div("Last Sync: " + (account.last_synced_at ? new Date(Date.parse(account.last_synced_at)).toString() : 'Never')),
									div("Login: " + account.login + " (" + account.domain_count + " Linked Domain(s))"),
									a({ 'class': "myButton grey", style: 'margin: 10px 0 0;', href: curry(Registrar.remove_link, account) }, "Unlink"),
									span(' '),
									error ? a({ 'class': "myButton red", style: 'margin: 10px 0 0;', href: curry(Registrar.show_link, account)}, "Fix Now")
									  : a({ 'class': "myButton", style: 'margin: 10px 0 0;', href: curry(Registrar.sync_now, account)}, "Sync Now")
								)
							)
					  );
					} else {
						console.log("Unknown account (" + account.site + ")", account);
					}
					
				})
			])
		));
	});
	
	define('linked_accounts_table_row', function(site, button) {
		return tr(
			td({ width: "70%" }, div({ style: "font-weight: bold; font-size: 20px; padding-left: 15px;" }, site)),
			td({ width: "30%" }, button)
		);
	});
	
	define('update_linked_account_row_handler', function(account) {
	  Badger.getAuthorizedAccountInfo(account.id, function(response) {
		  if (response.data.status == "linked") {
				$("#" + account.site + "-" + account.id).html(
					div({ 'class': "status-message", style: "margin: 5px auto 5px auto; height: 25px; width: 350px;" },
						img({ style: "margin-top: -11px", src: response.data.profile_image_url }),
						div({ style: "float: right; margin: 4px 25px auto auto;" }, response.data.name + " (@" + response.data.username + ")")
					)
				).css("text-align", "left");
		  } else {
        if (account.site == "twitter")
          var link_action = curry(TwitterAccount.show_link_accounts_modal, response.data.id);
        else if (account.site == "facebook")
          var link_action = curry(Facebook.show_link_accounts_modal, response.data.id);
		    
				$("#" + account.site + "-" + account.id).html(
				  div({ style: "margin: 15px 15px 15px auto; float: right" },span({ 'class': "error" }, "Account unlinked. ", a({ href: link_action }, "Link again?")))
				).css("text-align", "left");
		  }
		});
	});
	
	define('link_accounts_button', function(target) {
		return a({ 'class': "myButton", style: "float: right; margin: 5px auto 5px auto", href: target }, "Link");
	});
	
	define('authorize_account', function() {
		Badger.authorizeLinkedAccount("developer", function(response) {
			console.log(response);
		});
	});
	
	define('show_account_link_rows', function(accounts) {
		var sites = accounts.map(function(a) { return a.site });

    // always there
    var result = [
      linked_accounts_table_row("Go Daddy", link_accounts_button(curry(Registrar.show_link, {site: 'godaddy'}))),
      linked_accounts_table_row("Network Solutions", link_accounts_button(curry(Registrar.show_link, {site: 'networksolutions'})))
    ];

    // only linked once		
		if ($.inArray("twitter", sites) < 0) result.push(
			linked_accounts_table_row("Twitter", link_accounts_button(curry(TwitterAccount.show_link_accounts_modal)))
		);
		if ($.inArray("facebook", sites) < 0) result.push(
			linked_accounts_table_row("Facebook", link_accounts_button(curry(FacebookAccount.show_link_accounts_modal)))
		);
			
		return result;
	});
	
	define('close_window_and_reload_linked_accounts', function(old_account_id) {
	  // if fixing broken linked account, delete the old one
	  if (old_account_id) {
	    Badger.deleteLinkedAccount(old_account_id, function(response) {
	      hide_modal();
    		set_route("#linked_accounts");
	    });
	  } else {
      hide_modal();
  		set_route("#linked_accounts");
	  }
	});

}
