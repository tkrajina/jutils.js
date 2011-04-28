/**
 * Misc utility methods grouped in objects utils and ajax
 */

ajax = new Object()
dom = new Object()
utils = new Object()
html = new Object()
popup = new Object()

// --------------------------------------------------------------------------------------
// dom
// --------------------------------------------------------------------------------------

dom.byId = function( id ) {
	if( document.all ) {
		return document.all[ id ];
	}
	return document.getElementById( id );
}

dom.createElement = function( name, parameters, style, innerHTML ) {
	var element = document.createElement( name )
	if( parameters ) {
		for( parameter in parameters ) {
			element[ parameter ] = parameters[ parameter ]
		}
	}
	if( style ) {
		for( parameter in style ) {
			element.style[ parameter ] = style[ parameter ]
		}
	}
	if( innerHTML ) {
		element.innerHTML = innerHTML
	}
	return element
}

dom.walkRecursively = function( element, callOnElement ) {
	if( element && callOnElement ) {
		callOnElement( element )

		if( element.childNodes ) {
			for( i in element.childNodes ) {
				dom.walkRecursively( element.childNodes[ i ], callOnElement )
			}
		}
	}
}

dom.walk = function( callOnElement ) {
	dom.walkRecursively( document.documentElement, callOnElement )
}

// --------------------------------------------------------------------------------------
// ajax
// --------------------------------------------------------------------------------------

ajax.getXmlHttpRequest = function() {
	var xmlHttp = false
	try {
		xmlHttp = new ActiveXObject("Msxml2.XMLHTTP")
	}
	catch( e ) {
		try {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP")
		}
		catch( e2 ) {
			xmlHttp = false
		}
	}
	if( ! xmlHttp && typeof XMLHttpRequest != 'undefined' ) {
		xmlHttp = new XMLHttpRequest()
	}
	return xmlHttp
}

ajax.call = function( method, url, parameters, onResult, options ) {

	if( ! options ) {
		// Set defaults:
		options = new Object()
		options.blockPage = true
		options.keepBlocked = false
	}

	if( ! parameters )
		parameters = {}

	reqParams = ''
	for( key in parameters ) {
		reqParams += key + '=' + escape( parameters[ key ] ) + '&'
	}

	var xmlHttp = ajax.getXmlHttpRequest()

	xmlHttp.onreadystatechange = function() {

		if( xmlHttp.readyState == 4 ) {

			if( onResult ) {
				onResult( xmlHttp.responseText )
			}

			if( options.blockPage && ! options.keepBlocked )
				utils.unblockPage()
		}
	}

	if( method == 'POST' ) {
		xmlHttp.open( 'POST', url );
		xmlHttp.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
		xmlHttp.send( reqParams );
	}
	else {
		if( reqParams )
			url += '?' + reqParams

		xmlHttp.open( 'GET', url )
		xmlHttp.send( null )
	}

	if( options.blockPage )
		utils.blockPage( "Just a moment, please..." )
}

ajax.post = function( url, parameters, onResult, options ) {
	return ajax.call( 'POST', url, parameters, onResult, options )
}

ajax.get = function( url, parameters, onResult, options ) {
	return ajax.call( 'GET', url, parameters, onResult, options )
}

ajax.formSubmit = function( url, formElement, onResult, options ) {
	return ajax.post( url, utils.getFormParameters( formElement ), onResult, options )
}

// --------------------------------------------------------------------------------------
// Utils:
// --------------------------------------------------------------------------------------

utils.parseJson = function( data ) {
	if( 'string' == typeof data ) {
		return eval( '(' + data + ')' )
	}

	return data
}

utils.addListener = function( element, event, _function ) {
	if( element && element.addEventListener ) {
		element.addEventListener( event, _function, false )
	}
	else if( element.attachEvent ) {
		element.attachEvent( "on" + event, _function )
	}
}

utils.removeListener = function( element, event, _function ) {
	if( element && element.removeEventListener ) {
		element.removeEventListener( event, _function, false )
	}
	else if( element.detachEvent ) {
		element.detachEvent( "on" + event, _function )
	}
}

utils.getElementPosition = function( element ) {
	var curleft = curtop = 0;

	if( element.offsetParent ) {
		do {
			curleft += element.offsetLeft
			curtop += element.offsetTop
		}
		while( element = element.offsetParent )

		return [ curleft, curtop ]
	}

	return null
}

utils.blockPage = function( content, options ) {

	if( ! options ) {
		// Defaults:
		options = new Object()
		options.showCloseLink = true
		// TODO
		// options.width = '100px'
		// options.height = '100px'
	}

	var disablingDiv = document.getElementById( "disablingDiv" )
	var disablingDivContent = document.getElementById( "disablingDivContent" )

	var normalBrowser = navigator.userAgent.indexOf( 'MSIE' ) < 0
	if( normalBrowser ) {
		disablingDiv.style.position = 'fixed'
		disablingDivContent.style.position = 'fixed'
		disablingDiv.style.top = '0%'
		disablingDiv.style.left = '0%'
		disablingDiv.style.width = '100%'
		disablingDiv.style.height = '100%'
	}
	else {
		disablingDiv.style.position = 'absolute'
		disablingDivContent.style.position = 'absolute'
		disablingDiv.style.top = '0px'
		disablingDiv.style.left = '0px'
		disablingDiv.style.width = document.body.offsetWidth + 'px'
		disablingDiv.style.height = document.body.offsetHeight + 'px'
		disablingDivContent.style.paddingTop = document.documentElement.scrollTop + 'px'
	}

	if( options.showCloseLink ) {
		content += "<br/><br/><a href='javascript:void(utils.unblockPage())'>Close</a>"
	}

	disablingDivContent.innerHTML = content

	disablingDiv.style.zIndex = '100000'
	disablingDivContent.style.zIndex = '100001'

	disablingDiv.style.display = 'block'
	disablingDivContent.style.display = 'block'

	// TODO
	// disablingDivContent.style.width = options.width
	// disablingDivContent.style.height = options.height
	disablingDivContent.style.margin = 'auto'
	disablingDivContent.style.border = '1px solid black'
}

utils.unblockPage = function() {
	var disablingDiv = document.getElementById( "disablingDiv" )
	var disablingDivContent = document.getElementById( "disablingDivContent" )
	disablingDiv.style.display = 'none'
	disablingDivContent.style.display = 'none'
}

utils.openImage = function( imageKey ) {
	var onAjax = function( data ) {
		data = eval( "(" + data + ")" )
		var imageUrl = data[ 'image_url' ]
		var editUrl = data[ 'edit_url' ]
		var deleteUrl = data[ 'delete_url' ]
		text = '<img src="' + imageUrl + '" /><br/><br/>'
		if( editUrl ) {
			text += '<a href="' + editUrl + '">Edit</a>'
		}
		if( editUrl && deleteUrl ) {
			text += ' &middot; '
		}
		if( deleteUrl ) {
			text += '<a href="' + deleteUrl + '">Delete</a>'
		}
		utils.blockPage( text, true )
	}
	ajax.get( '/image:' + imageKey + '/ajax/data', onAjax, true )
}

utils.redirectIf = function( question, url ) {
	if( confirm( question ) ) {
		document.location = url
	}
}

utils.getFormParameters = function( formElement ) {
	result = {}
	for( i in formElement.elements ) {
		var name = formElement.elements[ i ].name
		var value = formElement.elements[ i ].value
		if( name && value ) {
			result[ name ] = value
		}
	}
	return result
}

// --------------------------------------------------------------------------------------
// html:
// --------------------------------------------------------------------------------------

html.hasClass = function( element, className ) {
	if( ! element.className ) {
		return false
	}
	var classes = element.className.split( /\s+/ )
	for( i in classes ) {
		if( className == classes[ i ] ) {
			return true
		}
	}
	return false
}

html.addClass = function( element, className ) {
	if( ! element.className ) {
		element.className = className
		return
	}
	var classes = element.className.split( /\s+/ )
	classes.push( className )
	element.className = classes.join( ' ' )
}

html.removeClass = function( element, className ) {
	if( ! element.className ) {
		return
	}
	var classes = element.className.split( /\s+/ )
	var result = new Array()
	for( i in classes ) {
		if( classes[ i ] != className ) {
			result.push( classes[ i ] )
		}
	}
	element.className = result.join( ' ' )
}

html.addMouseOverClass = function( element, className ) {
	utils.addListener( element, 'mouseover', function() { html.addClass( element, className ) } )
	utils.addListener( element, 'mouseout', function() { html.removeClass( element, className ) } )
}

// TODO

// Dok je na meniItemu ili meniju -- prikaže se
// Kad izađe -- čeka .75 sekunde da se obriše
// Kad se otvori bilo koji meni -- ostali se zatvaraju

popup.addPopup = function( element ) {
	utils.addListener( element, 'mouseover', popup.showMenu )
	utils.addListener( element, 'mouseout', popup.hideMenu )
}

popup.showMenu = function( event ) {
	var element = event.target
	dom.walkRecursively( element, function( subElement ) {
		if( html.hasClass( subElement, 'menuBody' ) ) {
			subElement.style.visibility = 'visible'
			subElement.style.top = element.offsetHeight + 1 + 'px'
		}
	} )
}

popup.hideMenu = function( event ) {
	var element = event.target
	dom.walkRecursively( element, function( subElement ) {
		if( html.hasClass( subElement, 'menuBody' ) ) {
			subElement.style.visibility = 'hidden'
		}
	} )
}

/*

popup.hideMenuTimeouts = new Array();
popup.registeredMenus = new Array();
popup.maxZIndex = 9999;
 
popup.register = function( menu ) {
	if( "string" == typeof menu ) {
		menu = document.getElementById( menu );
	}
	if( menu ) {
		popup.registeredMenus.push( menu );
	}
}
 
popup.show = function( menu ) {
	if( "string" == typeof menu ) {
		menu = document.getElementById( menu );
	}
	try {
		// Ako je u toku postupak zatvaranja: brisemo to:
		clearTimeout( popup.hideMenuTimeouts[ menu.id ] );
	}
	catch( e ) {}
	// Brisemo sve ostale menije koji su eventualno zatvoreni:
	for( m in popup.registeredMenus ) {
		m = popup.registeredMenus[ m ];
		if( m && m.style ) {
			m.style.visibility = "hidden";
		}
	}
	if( menu ) {
		popup.register( menu );
		menu.style.visibility = "visible";
		menu.style.zIndex = popup.maxZIndex;
		++ popup.maxZIndex;
	}
}
 
popup.hide = function( menu ) {
	if( "string" == typeof menu ) {
		menu = document.getElementById( menu );
	}
	var str = "document.getElementById(\"" + menu.id + "\").style.visibility=\"hidden\"";
	popup.hideMenuTimeouts[ menu.id ] = setTimeout( str, 750 );
}

*/
