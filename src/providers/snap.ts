import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Plugin, Cordova, CordovaProperty, CordovaInstance, IonicNativePlugin} from '@ionic-native/core';
 
@Plugin(
  {
	pluginName: "snapchat",
	plugin: "cordova-plugin-snapchat",
	pluginRef: "SnapChat",
	platforms: ['iOS','Android']
  }
)  


 @Injectable()
 export class SnapProvider {
	/* @Cordova()
	shareWithSnapChat(arg1: any):Promise<string>
	{
		return;
	} */
  
	@Cordova()
	add(arg1: any):Promise<string>
	{
		return;
	} 
  
 }
