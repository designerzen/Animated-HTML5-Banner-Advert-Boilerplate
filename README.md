#**HTML5** Banner Ad _Springboard_#

**Incredibly quick framework** and toolset for developing and deploying **Banner Adverts** based around the GreenSock Tweening Engine.

Includes [FlashTalking](http://www.flashtalking.net/) **built in!**

With a few simple changes, html and css are easy to modify and leverage Jade and LESS to allow you to use regular html or css as well as their more advanced siblings.

It uses the [Gulp](www.github.com) infrastructure to build and create templates for your projects as well as creating deliverable zip files with everything ready and set up built right in.

Contains full versions of [Type Rendering Mix](http://typerendering.com/)

This is a fully working version that has been used in many campaigns already! 


##Requirements##
The only requirement is [NodeJS](http://nodejs.org/) and about _100mb of free space_ on your machine.


##Installation##
After installing NodeJS on your machine,
In a Command Prompt :

> sudo npm install

This will create a folder called "node_modules" which inside will contain all of this project's dependencies.

Whilst that is downloading and installing (usually a few minutes) you can **edit the config.json** file in the root folder.

Once the installation has completed, ensure all the software is correctly installed by typing :
 
> gulp

Which should bring up a little help message with the available options. 

_If you cannot see this_, try doing a **fresh clone of this repo** and retrying the installation steps.

Also, you may find an answer to your problems in the **FAQ** below.

###To Create templates###
You should really start here, with the built in template system. This creates a series of Jade files that just require personalisation of content - ready for adding in your animated elements.

Firstly _ensure that you have editted the config.json_ with your appropriate settings.
Pay close attention to types (remove any that don't apply) and variants...
And add as many variants as you wish (these are the duplicate templates named accordingly)

Types are the required sizes for the campaign. You can use any of the following :

**
// Generic ---
"banner", 
"halfBanner", 
"halfPage", 
"leaderboard", 
"mpu", 
"skyscraper", 
"verticalBanner", 
"wideSkyscraper

// Mobiles ---
"mobileBanner",
"mobileMpu",
"mobileLeaderboard",

// Expandables ---
"expandableLeaderboard",
"expandableMpu",
"expandableSkyscraper",
"expandableWideSkyscraper",
"expandableHalfPage",
"expandableBanner",
"expandableVerticalBanner",
"expandableHalfBanner",
"expandableBanner",
"expandableMpu",
"expandableLeaderboard"
**

Variants can be anything you want but primarily are useful for creating language variants

eg. 'en', 'th', 'hk', 'de'

If you have common elements on all of your pages, you can edit the **template.jade partial** as these will be cloned into your templates. 

You can use the shortcut **#{type}** wherever you want to have type specific elements (mpu/skyscraper/banner etc).
The shortcuts **#{width}** and **#{height}** are also available if you wish to use them!

Then run :

> gulp scaffold

to create both jade template files for adding in your content, and a project manifest for each size.

NB. if you just want jade (templates) or javascript manifests

> gulp templates

> gulp manifest


##Configuration##
All of the settings can be set by altering the parameters in the config.json file.
You may use various styles of comments within this file (although json itself does not allow them - these are stripped off before compilation).

There is internal documentation directly next to the parameters that you can set. 

You should not have to change the dimensions in the sizes object unless you are working on a campaign that is a unique size, and it may be best to create a new set of sizes specifically for your project.


##To Develop##
To aid in the rapid development of campaigns, there are a number of _time saving features_ and _helpers_ available to help shape your CSS and HTML.

Once you have created your templates, you can manually change each one as is relevant for that variant. 

For example, you may set in your config file 

> variants : [ 'en', 'th', 'hk', 'de' ]

The scaffold task would then create Jade files for each language and size. You can then open the hk variant for example, and update the copy to the Chinese language. 

#####Less#####
```
src/less
```
There are a few helper mixins in the src/less/helpers.less file such as

```
.x(50) 						which once compiled becomes left:50px;
.y(50) 						which once compiled becomes top:50px;

.size(150px) 				which when compiled becomes width:150px; height:150px;
.size(150px,75px)			which when compiled becomes width:150px; height:75px;

.w( 50px )					which when compiled becomes width:50px;
.h( 75px )					which when compiled becomes height:75px;

.position( x, y )
.position( top, right, bottom, left )
.position( top, right, bottom, left, z-index )

.user-select()				prevents textfields being selectable for example

.clearfix() 				inserts the clear-fix hack for clearing floating elements
```

#####Jade####
```
src/jade/
src/jade/partials
```
You can edit the **template.jade** partial too, these changes will appear in your templates when you run "gulp template"

To overwrite your created jade template files, you can run 

> gulp jade-create


#####Javascript####
In the src/scripts folder you will find 3 files of interest. 
The FlashTrack file contains the Flash Talking interface (If you are doing instant Ads, it has the method preset, if not, delete as applicable)
The Animation file is boilerplate code for writing your own timeline based animations. Delete whatever you feel you don't need.

```
src/javascript/							Home for your own scripts
src/javascript/animation.js				The script that conatins your time line and associated animations
src/javascript/manifest.js				FlashTalking manifest template
src/javascript/flashtrack.js			FlashTalking API code
src/javascript/vendors/					Home for any libraries you want transcluded in your main.js file
src/javascript/vendors/trmix.min.js		http://typerendering.com/
src/javascript/vendors/FontScale.js		A simple way to resize the font in a field to maximum size
src/javascript/vendors/tweenlite/		One of two potential rendering engines - this one is small
src/javascript/vendors/tweenmax/		This one is much bigger but is more feature rich
```


###To Build For _Testing_###

> gulp build


###To Compile For Release to _Creatives_###

This creates a minified version that allows creatives to test the varieties easily while retaining a single folder structure

> gulp compile


###To Compile For _Distribution_###

Compiling creates a **Release** folder that contains X folders _(per campaign)_
  
> gulp distribute
    
As well as **one ZIP file that represents one release folder** in the format
The filesize is displayed in the console when run.

release / **Name-Type-Variant.zip**

Where **Name**, **Type** and **Variant**  are read in from the **package.json** file

_eg. Kittens-mpu-a.zip_

Uploading your advert to agencies usually requires a zip file with the campaign inside - these are those files.


###Troubleshooting###
**Q.** There are no html files in my build or dist folders!

**A.** Be sure to have run the templater with gulp taemplate first, or at least create jade files in the jade folder that extends the base.jade partial


**Q.** Config task seems to be failing... it can't find the config.json file?

**A.** Delete the node_modules folder and then run npm install again. This sometimes happens if the dependencies have not fully resolved, yet no error message may be shown.


**Q.** Getting errors about things not being found when running node

**A.** Weirdness in that the modules do not get added to dependencies so run, so delete node_modules folder then re-run installation steps.


**Q.** Error while running **distribute**

**A.** Sometimes (in Windows) node will fail to delete a folder due to Explorer keeping certain files in it's cached memory (such as thumbs.db). If you encounter this, try and close down any app that uses those files then re-run the dist task.


---
Released under the [**GPL2.0 license**](http://www.gnu.org/licenses/gpl-2.0.txt). 
_If you improve this work, please let us know._

Made with ease of use and speed in mind by [designerzen](https://github.com/designerzen/animated-html5-banner-advert-boilerplate)