#**HTML5** Banner Ad _Springboard_#

**Incredibly quick framework** and toolset for developing and deploying **Banner Adverts** based around the GreenSock Tweening Engine.

Includes FlashTalking **built in!**

It uses the [Gulp](www.github.com) infrastructure to build and create templates for your projects as well as creating deliverable zip files with everything ready and set up built right in.

This is a fully working beta version! 

##Requirements##
The only requirement is [NodeJS](http://nodejs.org/)


##Installation##
After installing NodeJS on your machine,
In a Command Prompt :

> sudo npm install -g gulp

> sudo npm install

Then while that is downloading and installing, **edit the config.json** file in the root folder.

Once the installation has completed, ensure all the software is correctly installed by
 typing :
 
> gulp


###To Create templates###
You should really start here, with the built in template system. This creates a series of Jade files that just require personalisation of content - ready for adding in your animated elements.

Firstly _ensure that you have editted the config.json_ with your appropriate settings.
Pay close attention to types (remove any that don't apply) and variants...
And add as many variants as you wish (these are the duplicate templates named accordingly)

If you have common elements on all of your pages, you can edit the **template.jade partial** as these will be cloned into your templates. 

You can use the shortcut #{type} where-ever you want to have type specific elements (mpu/skyscraper/banner etc).
The shortcuts #{width} and #{height} are also available if you wish to use them!

Then run :

> gulp templates
> gulp manifests

or simply : 

> gulp create


##Configuration##
All of the settings can be set by altering the parameters in the config.json file.
You may use various styles of comments within this file (although json itself does not allow them - these are stripped off before compilation)
There is internal documentation directly next to the parameters that you can set. 
You should not have to change the dimensions in the sizes object unless you are working on  campaign that is a unique size, and it may be best to create a new set of sizes specifically for your project.

##To Develop##
Edit template.jade before running gulp templates


#####Less#####
```
src/less
```

#####Jade####
```
src/jade/
src/jade/partials
```
You can edit the **template.jade** partial too, this will appear in your templates when you run "gulp template"

To overwrite your jade template files, you can run 

> gulp jade-create

#####Javascript####
In the src/scripts folder you will find 3 files of interest. 
The FlashTrack file contains the Flash Talking interface (If you are doing instant Ads, it has the method preset, if not, delete as applicable)
The Animation file is boilerplate code for writing your own timeline based animations. Delete whatever you feel you don't need.

```
src/jade/
src/jade/partials
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



###FAQ###
**Q.** There are no html files in my build or dist folders!

**A.** Be sure to have run the templater with gulp taemplate first, or at least create jade files in the jade folder that extends the base.jade partial


**Q.** Config task seems to be failing... it can't find the config.json file?

**A.** Delete the node_modules folder and then run npm install again. This sometimes happens if the dependencies have not fully resolved, yet no error message may be shown.


**Q.** Getting errors about things not being found when running node

**A.** Weirdness in that the modules do not get added to dependencies so run,
they seem to work for most people but if you are having issues, run :

> npm install --save-dev imagemin-pngquant
> npm install --save-dev imagemin-jpegoptim

---
Released under the [**GPL2.0 license**](http://www.gnu.org/licenses/gpl-2.0.txt). 
_If you improve this work, please let us know._

Made with ease of use and speed in mind by [designerzen](https://github.com/designerzen/animated-html5-banner-advert-boilerplate)