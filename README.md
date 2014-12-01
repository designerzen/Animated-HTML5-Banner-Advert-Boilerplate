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

Then while that is downloading and installing, **edit the package.json** file in the root folder.

Once the installation has completed, ensure all the software is correctly installed by
 typing :
 
> gulp


###To Create templates###
You should really start here, with the built in template system. This creates a series of Jade files that just require personalisation of content - ready for adding in your animated elements.

Firstly _ensure that you have editted the package.json_ with your appropriate settings.
Pay close attention to types (remove any that don't apply) and variants...
And add as many variants as you wish (these are the duplicate templates named accordingly)

Then run :

> gulp templates


##To Develop##


#####Less#####
```
src/less
```

#####Jade####
```
src/jade/
src/jade/partials
```
You can edit these partials too, then it will appear in your templates when you run "gulp template"



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

**Name-Type-Variant-Version(-Date).zip**

Where **Name**, **Type**, **Variant** and **Version** are set in the **package.json** file

_eg. Kittens-mpu-a-1.1.1.zip_


###FAQ###
**Q.** There are no html files in my build or dist folders!

**A.** Be sure to have run the templater with gulp taemplate first, or at least create jade files in the jade folder that extends the base.jade partial


**Q.** Config task seems to be failing... it can't find the config.json file?

**A.** Delete the node_modules folder and then run npm install again. This sometimes happens if the dependencies have not fully resolved, yet no error message may be shown.

---
Released under the [**GPL2.0 license**](http://www.gnu.org/licenses/gpl-2.0.txt). 
_If you improve this work, please let us know._

Made with ease of use and speed in mind by [designerzen](https://github.com/designerzen/animated-html5-banner-advert-boilerplate)