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

dom.removeChildren = function( element ) {
	if( ! element ) return

	while( element.hasChildNodes() ) {
		element.removeChild( element.childNodes[ 0 ] )
	}
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

/**
 * "Walks" all the subnodes of this node.
 *
 * If the function callOnElement returns anything that is not false the "walk" will stop
 * there, and the result will be returned from the main function.
 */
dom.walkSubtree = function( element, callOnElement ) {
	if( element && callOnElement ) {
		var result = callOnElement( element )
		if( result )
			return result

		if( element.childNodes ) {
			for( i in element.childNodes ) {
				var result = dom.walkSubtree( element.childNodes[ i ], callOnElement )
				if( result )
					return result
			}
		}
	}
}

/**
 * Unline walkTree(), this method walks the current branch. I.e, from the current element
 * to the root. If callOnElement returns a non-false result the "walk" will stop there
 * and this value will be returned by this method.
 */
dom.walkBranch = function( element, callOnElement ) {
	var currentElement = element
	while( currentElement && currentElement != document ) {

		var result = callOnElement( currentElement )

		if( result )
			return result

		if( currentElement.parentNode )
			currentElement = currentElement.parentNode
	}
}

/**
 * See dom.walkSubtree
 */
dom.walk = function( callOnElement ) {
	return dom.walkSubtree( document.documentElement, callOnElement )
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

	// Block page imediately, otherwise the ajax result may come before the block happens
	if( options.blockPage )
		utils.blockPage( "Just a moment, please...", { 'showCloseLink': false } )

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
	} else {
		if( reqParams )
			url += '?' + reqParams

		xmlHttp.open( 'GET', url )
		xmlHttp.send( null )
	}

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

utils.getAndIncrementMaxZIndex = function() {
	if( utils.maxZIndex ) {
		var result = utils.maxZIndex
		utils.maxZIndex += 1
		return result
	} else {
		utils.maxZIndex = 100000
		dom.walk( function( element ) {
			if( element.style && element.style.zIndex ) {
				var currentZIndex = parseInt( element.style.zIndex )
				if( currentZIndex > utils.maxZIndex )
					utils.maxZIndex = currentZIndex + 1
			}
		} )

		return utils.getAndIncrementMaxZIndex()
	}
}

utils.addListener = function( element, event, _function ) {
	if( element && element.addEventListener ) {
		element.addEventListener( event, _function, false )
	} else if( element.attachEvent ) {
		element.attachEvent( "on" + event, _function )
	}
}

utils.removeListener = function( element, event, _function ) {
	if( element && element.removeEventListener ) {
		element.removeEventListener( event, _function, false )
	} else if( element.detachEvent ) {
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

utils.initBlockPageDivs = function() {
	if( ! dom.byId( 'blockDiv' ) ) {
		var blockPageDiv = dom.createElement( 'div', { 'id': 'blockDiv' }, {}, '' )
		var blockPageDivContent = dom.createElement( 'div', { 'id': 'blockDivContent' }, {}, '' )

		var body = document.getElementsByTagName( 'body' )[ 0 ]
		body.appendChild( blockPageDiv )
		body.appendChild( blockPageDivContent )

		// When, for example, the div contains an image, it will be resizes only when the image
		// size is known. So we must check the size
		blockPageDivContent.checkPosition = function() {
			var width = this.offsetWidth
			var height = this.offsetHeight 

			var bodyWidth = document.body.offsetWidth
			var bodyHeight = document.body.offsetHeight

			this.style.left = ( ( bodyWidth - width ) / 2 ) + 'px'

			// TODO
			// this.style.top = ( ( bodyHeight - height ) / 2 ) + 'px'

			this.style.top = '40px'

			this.timeout = setTimeout( 'dom.byId("blockDivContent").checkPosition()', 100 )
		}

		blockPageDivContent.stopCheckingPosition = function() {
			if( this.timeout ) {
				clearTimeout( this.timeout )
			}
		}
	}
}

utils.blockPage = function( content, options ) {
	utils.initBlockPageDivs()

	if( ! options ) {
		// Defaults:
		options = new Object()
		options.showCloseLink = true
		options.width = '100px'
		options.height = null
		options.top = '100px'
		options.left = '100px'
	}

	var blockDiv = document.getElementById( "blockDiv" )
	var blockDivContent = document.getElementById( "blockDivContent" )

	blockDivContent.checkPosition()

	var normalBrowser = navigator.userAgent.indexOf( 'MSIE' ) < 0
	if( normalBrowser ) {
		blockDiv.style.position = 'fixed'
		blockDivContent.style.position = 'fixed'
		blockDiv.style.top = '0%'
		blockDiv.style.left = '0%'
		blockDiv.style.width = '100%'
		blockDiv.style.height = '100%'
	} else {
		blockDiv.style.position = 'absolute'
		blockDivContent.style.position = 'absolute'
		blockDiv.style.top = '0px'
		blockDiv.style.left = '0px'
		blockDiv.style.width = document.body.offsetWidth + 'px'
		blockDiv.style.height = document.body.offsetHeight + 'px'
		blockDivContent.style.paddingTop = document.documentElement.scrollTop + 'px'
	}

	if( ! content ) {
		content = ''
	}

	if( options.showCloseLink ) {
		content += '<div id="blockDivClose"><a href="javascript:void(utils.unblockPage())"><img src="https://github.com/tkrajina/jutils.js/raw/master/close.png" style="border:none" /></a></div>' 
	}

	dom.removeChildren( blockDivContent )

	blockDivContent.innerHTML = '<div class="blockDivMessage">' + content + '</div>'

	blockDiv.style.zIndex = utils.getAndIncrementMaxZIndex()
	blockDivContent.style.zIndex = utils.getAndIncrementMaxZIndex()

	blockDiv.style.display = 'block'
	blockDivContent.style.display = 'block'

	// TODO
	// blockDivContent.style.width = options.width
	// blockDivContent.style.height = options.height
	blockDivContent.style.border = '1px solid black'
}

utils.unblockPage = function() {
	var blockDiv = document.getElementById( "blockDiv" )
	var blockDivContent = document.getElementById( "blockDivContent" )

	blockDiv.style.display = 'none'
	blockDivContent.style.display = 'none'

	blockDivContent.stopCheckingPosition()
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

/**
 * Returns the target element for an event.
 */
utils.getEventTarget = function( event ) {
	if( event.srcElement ) {
		return event.srcElement
	}
	return event.target
}

// --------------------------------------------------------------------------------------
// html:
// --------------------------------------------------------------------------------------

html.getComputedStyle = function( element, style ) {
	if( element.currentStyle )
		return element.currentStyle[ style ]
	else if( window.getComputedStyle )
		return document.defaultView.getComputedStyle( element, null ).getPropertyValue( style )
}

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

/** Contains menu items. Every menuItem has a menuBody property. */
popup.registeredMenus = []
popup.currentMenuId = 1

/**
 * Menu registration. Every menu must have a subelement with class="menuBody" which is a
 * submenu to be shown.
 */
popup.registerMenu = function( element ) {
	// Find the first subElement with class 'menuBody':
	var subMenu = dom.walkSubtree( element, function( subElement ) {
		if( html.hasClass( subElement, 'menuBody' ) ) {
			return subElement
		}
	} )

	// Store submenu, and register it:
	if( subMenu ) {
		utils.addListener( element, 'mouseover', popup.showMenuByEvent )
		utils.addListener( element, 'mouseout', popup.startHidingMenuByEvent )

		element.menuBody = subMenu
		popup.registeredMenus.push( element )
	}
}

/** For private use */
popup.showMenuByEvent = function( event ) {
	popup.showMenu( utils.getEventTarget( event ) )
}

/** For private use */
popup.startHidingMenuByEvent = function( event ) {
	popup.startHidingMenu( utils.getEventTarget( event ) )
}

/**
 * Hides all menus. The option exceptMenu is optional. 
 */
popup.hideAllMenus = function( exceptMenu ) {
	for( i in popup.registeredMenus ) {
		var menu = popup.registeredMenus[ i ]
		if( ! exceptMenu || menu != exceptMenu ) {
			menu.menuBody.style.visibility = 'hidden'
		}
	}
}

/**
 * Just shows the menu.
 */
popup.showMenu = function( element ) {

	// remove evenual hiding timeout for this menu
	if( popup.hideMenuTimeout )
		clearTimeout( popup.hideMenuTimeout )

	// This event may occur on the menu or on the menu body or on any of their chidren
	var menuBody = dom.walkBranch( element, function( el ) {
		for( i in popup.registeredMenus ) {
			var menu = popup.registeredMenus[ i ]
			if( menu.menuBody == el ) {
				return el
			}
		}
	} )

	// If this event is on menu body, then everything is already OK
	if( menuBody ) 
		return

	var menuItem = dom.walkBranch( element, function( el ) {
		for( i in popup.registeredMenus ) {
			var menu = popup.registeredMenus[ i ]
			if( menu == el ) {
				return el
			}
		}
	} )

	// hide all other menus
	popup.hideAllMenus()

	// Show and position the menu body:

	//alert( menuItem.id + '->' + menuBody.id )

	menuItem.menuBody.style.visibility = 'visible'
	menuItem.menuBody.style.left = '0px'
	menuItem.menuBody.style.top = menuItem.offsetHeight + 1 + 'px'
	menuItem.menuBody.style.zIndex = utils.getAndIncrementMaxZIndex()
}

/**
 * Hides the menu .75 seconds from now. Stores the timeout object
 */
popup.startHidingMenu = function( element ) {
	popup.hideMenuTimeout = setTimeout( 'popup.hideAllMenus()', 750 );
}

popup.tooltipText = null
popup.tooltipTimeout = null

/**
 * Will register a popup for this element. 
 * 
 * If the textOrFunction is a string then the tooltip will be filled with this string.
 * 
 * If the textOrFunction is a function, the the function will be executed (the only
 * argument is the event) and the result will be filled in the tooltip.
 */
popup.registerTooltip = function( element, textOrFunction ) {
	popup.initTooltipDiv()
	utils.addListener( element, 'mousemove', function( event ) {

		popup.hideTooltip()

		if( 'string' == typeof textOrFunction )
			var text = textOrFunction
		else
			var text = textOrFunction( event )

		popup.tooltipText = text
		popup.tooltipX = event.clientX
		popup.tooltipY = event.clientY

		popup.tooltipTimeout = setTimeout( 'popup.showTooltip()', 500 )
	} )
	utils.addListener( element, 'mouseout', function( event ) {
		popup.hideTooltip()
	} )
}

popup.initTooltipDiv = function() {
	if( ! dom.byId( 'tooltip' ) ) {
		var tooltipDiv = dom.createElement( 'div', { 'id': 'tooltip' }, {}, '' )
		var body = document.getElementsByTagName( 'body' )[ 0 ]
		body.appendChild( tooltipDiv )
	}
}

popup.showTooltip = function() {
	var tooltip = dom.byId( 'tooltip' )
	tooltip.style.visibility = 'visible'
	tooltip.style.left = popup.tooltipX + 20 + 'px'
	tooltip.style.top = popup.tooltipY + 'px'
	tooltip.innerHTML = popup.tooltipText
}

popup.hideTooltip = function() {
	if( popup.tooltipTimeout )
		clearTimeout( popup.tooltipTimeout )

	var tooltip = dom.byId( 'tooltip' )
	tooltip.style.visibility = 'hidden'

}
