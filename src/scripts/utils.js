// Global Utilities for 
var UTIL = UTIL || {};

// Polyfilling Class Management
UTIL.removeClass = function( element, className )
{
    if (element.classList) element.classList.remove(className);
    else element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
};

UTIL.addClass = function( element, className )
{
    if (element.classList) element.classList.add(className);
    else element.className += ' ' + className;
};

    