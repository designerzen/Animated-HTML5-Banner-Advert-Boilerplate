#**HTML5** Banner Ad _Springboard_#

**Incredibly quick framework** and toolset for developing and deploying **Banner Adverts** based around the GreenSock Tweening Engine.

Includes [FlashTalking](http://www.flashtalking.net/) **built in!**

With a few simple changes, html and css are easy to modify and leverage Jade and LESS to allow you to use regular html or css as well as their more advanced siblings.

It uses the [Gulp](www.github.com) infrastructure to build and create templates for your projects as well as creating deliverable zip files with everything ready and set up built right in.

For instructions on how to use, please check out the [Wiki](https://github.com/designerzen/Animated-HTML5-Banner-Advert-Boilerplate/wiki)


##Requirements##
The only requirement is [NodeJS](http://nodejs.org/) and about _100mb of free space_ on your machine.


##Installation##
After installing NodeJS on your machine,
In a Command Prompt :

> sudo npm install

or on Windows,

> npm install 


This will create a folder called "node_modules" which inside will contain all of this project's dependencies.

Whilst that is downloading and installing (usually a few minutes) you can **edit the config.json** file in the root folder.

Once the installation has completed, ensure all the software is correctly installed by typing :
 
> gulp

Which should bring up a little help message with the available options. 

_If you cannot see this_, try doing a **fresh clone of this repo** and retrying the installation steps.

Also, you may find an answer to your problems in the **FAQ** in the [Wiki](https://github.com/designerzen/Animated-HTML5-Banner-Advert-Boilerplate/wiki).

##Configuration##
All of the settings can be set by altering the parameters in the options.json file.
You may use various styles of comments within this file.

There is internal documentation directly next to the parameters that you can set. 

You should not have to change the dimensions in the sizes object unless you are working on a campaign that is a unique size, and it may be best to create a new set of sizes specifically for your project.


##To Develop##
To aid in the rapid development of campaigns, there are a number of _time saving features_ and _helpers_ available to shape your CSS and HTML.

Once you have created your templates, you can manually change each one as is relevant for that variant. 

For example, you may set in your config file 

> variants : [ 'en', 'th', 'hk', 'de' ]

The scaffold task would then create Jade files for each language and size. 
You can then open the hk variant for example, and update the copy to the Chinese language. 





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
src/javascript/utils.js				    Some cross-browser classes that are very useful
src/javascript/manifest.js				FlashTalking manifest template
src/javascript/flashtrack.js			FlashTalking API code
src/javascript/vendors/					Home for any libraries you want transcluded in your main.js file
src/javascript/vendors/trmix.min.js		http://typerendering.com/
src/javascript/vendors/FontScale.js		A simple way to resize the font in a field to maximum size
src/javascript/vendors/tweenlite/		One of two potential rendering engines - this one is small
src/javascript/vendors/tweenmax/		This one is much bigger but is more feature rich
```

######utils.js######
```
UTIL.addClass( element, className )     Add a class to a named element
UTIL.removeClass( element, className )  Remove a class (if it exists) from a named element
```

###To Build For _Testing_###

> gulp debug


###To Compile For Release to _Creatives_###

This creates a minified version that allows creatives to test the varieties easily while retaining a single folder structure

> gulp build


###To Compile For _Distribution_###

Compiling creates a **Release** folder that contains X folders _(per campaign)_
  
> gulp distribute
    
As well as **one ZIP file that represents one release folder** in the format
The filesize is displayed in the console when run.

release / **Name-Type-Variant.zip**

Where **Name**, **Type** and **Variant**  are read in from the **package.json** file

_eg. Kittens-mpu-a.zip_

Uploading your advert to agencies usually requires a zip file with the campaign inside - these are those files.




---
Released under the [**GPL2.0 license**](http://www.gnu.org/licenses/gpl-2.0.txt). 
_If you improve this work, please let us know._

Made with ease of use and speed in mind by [designerzen](https://github.com/designerzen/animated-html5-banner-advert-boilerplate)
