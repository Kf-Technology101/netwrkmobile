import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { Slides } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LocalStorage } from '../../providers/local-storage';
import { Settings } from '../../providers/settings';

// Pages
import { ChatPage } from '../chat/chat';
import { LinePage } from '../linelist/linelist';
import { ProfilePage } from '../profile/profile';
import { NetwrklistPage } from '../netwrklist/netwrklist';

// Providers
import { UndercoverProvider } from '../../providers/undercover';
import { Tools } from '../../providers/tools';
import { SlideAvatar } from '../../providers/slide-avatar';
import { Auth } from '../../providers/auth';
import { Chat } from '../../providers/chat';

import { heroes } from '../../includes/heroes';
import { heroesLines } from '../../includes/heroesLines';
import * as moment from 'moment';

@Component({
  selector: 'page-undercover-character',
  templateUrl: 'undercover-character.html'
})
export class UndercoverCharacterPage {
  @ViewChild(Slides) slides: Slides;
  public persons: Array<any> = [];
  public activePerson: any = {
    name: '',
    description: '',
    imageUrl: ''
  };
  public sliderLoaded: boolean = false;
  public changeError: string;
  public textError: string;
  private user: any = {};
  private pageTag: string;
  private firstTimeHero: boolean = true;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public settings: Settings,
    public undercoverPrvd: UndercoverProvider,
    public toolsPrvd: Tools,
    public slideAvatarPrvd: SlideAvatar,
    public authPrvd: Auth,
    elRef: ElementRef,
    private storage: LocalStorage,
    public splash: SplashScreen,
	private chatPrvd: Chat,
  ) {
    this.pageTag = elRef.nativeElement.tagName.toLowerCase();
    this.changeError = 'You can\'t leave this page right now';
    this.textError = 'Something went wrong, please try again later';

    this.user = this.authPrvd.getAuthData();
    this.getPersons();
  }

  choosePerson(avatar) {
	 this.activePerson.name=avatar.name;
     this.activePerson.imageUrl=avatar.imageUrl;
     this.activePerson.description=avatar.description;
	 if(this.settings.isCreateLine){
		this.settings.lineAvatar = this.activePerson;
		if(avatar.name.toLowerCase() == "private group"){
			console.log('pri');			
			this.slideAvatarPrvd.setSliderPosition('right');
			this.slideAvatarPrvd.sliderPosition = 'right';
			this.storage.set('slider_position','right');
			if(this.storage.get('edited-page')=="holdpage"){
				let lineAvtr = this.settings.lineAvatar;
				let item = this.storage.get('last-activity');
				let locDetails = this.storage.get('last_hold_location_details');
				let place_name = locDetails.place_name;
				let input_string = place_name.indexOf(",")>-1?place_name.substring(0, place_name.indexOf(",")):place_name;
				let title =  item.itemName+' near '+input_string;
				
				let params: any = {
					text: item.itemName,
					title:title,
					text_with_links:item.itemName,
					role_name: lineAvtr.name,
					place_name: place_name
				}
				
				this.postMessage(params);
			}else{
				this.settings.isCreateLine = false;
				this.toolsPrvd.pushPage(LinePage);
			}
		}else if(avatar.name.toLowerCase() == "public network"){
			console.log('pub');
			this.slideAvatarPrvd.setSliderPosition('left');
			this.slideAvatarPrvd.sliderPosition = 'left';
			this.storage.set('slider_position','left');
			this.settings.isCreateLine = false;
			this.toolsPrvd.pushPage(LinePage);
		}else{
			console.log('pri');
			this.slideAvatarPrvd.setSliderPosition('right');
			this.slideAvatarPrvd.sliderPosition = 'right';
			this.storage.set('slider_position','right');
			this.settings.isCreateLine = false;
			this.toolsPrvd.pushPage(LinePage);
		}		
	 }else{
		this.undercoverPrvd.setPerson(this.activePerson).then(data => {
		  if (this.storage.get('first_time_hero') === null) {
			this.firstTimeHero = false;
			this.storage.set('first_time_hero', this.firstTimeHero);
		  }		
		  this.settings.isCreateLine = false;
		  this.toolsPrvd.pushPage(ProfilePage, data);
		}, err => {
		  this.toolsPrvd.popPage();
		  this.settings.isCreateLine=false;
		});
	 }
  }
  
  private postMessage(params?: any){
	let messageParams: any = {};
	let message: any = {};
	messageParams = {
				messageId: null,
				text: params.text,
				text_with_links: params.text,
				user_id: this.user ? this.user.id : 0,
				role_name: params.role_name,
				title: params.title,
				place_name: params.place_name,
				images: [],
				video_urls: [],
				undercover: true,
				public: false,
				is_emoji: false,
				locked: false,
				password: null,
				hint: null,
				expire_date: null,
				timestamp: Math.floor(new Date().getTime()/1000),
				line_avatar:[]
	};
	message = Object.assign(message, messageParams);
	/* console.log(messageParams);
	return false; */
	
	this.chatPrvd.sendMessage(messageParams).then(res => {
		this.settings.isCreateLine = false;
		message.user_id = this.user.id;
		message.user = this.user;
		message.image_urls = message.images;
		message.is_synced = false;
		this.navCtrl.push(NetwrklistPage, {
		  message: res
		});
	});
			
  }

  private goBack() {
	this.settings.isCreateLine = false;
	if(this.storage.get('edited-page') == "profile"){
		this.storage.rm('edit-post');
		this.storage.rm("edited-page");
		this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 3));
		// this.toolsPrvd.popPage();
	}else{
		this.storage.rm('edit-post');
		this.storage.rm("edited-page");
		this.toolsPrvd.popPage();
	}
	// this.navCtrl.popToRoot();
  }
  
  private getPersons() {
    let age = moment().diff(this.user.date_of_birthday, 'years');
    if (age >= 13 && age < 20) {
      age = 13;
    } else if (age >= 20 && age < 40) {
      age = 20;
    } else {
      age = 40;
    }
	
	if(this.settings.isCreateLine){
		this.persons.push(heroes.default);
        for (let i = 0; i < heroes[age].length; i++) {
            this.persons.push(heroes[age][i]);
        }
    }else{
		this.persons.push(heroesLines.default);
        for (let i = 0; i < heroesLines[age].length; i++) {
            this.persons.push(heroesLines[age][i]);
        }
    }
	
	let defaultHero = this.persons[0];
    let secondHero = this.persons[1];
	this.persons[0] = secondHero;
    this.persons[1] = defaultHero;
	
    console.log('characters:', this.persons);
  }

  private changeSlider() {
    let allSlides = document.getElementsByClassName('swiper-slide');
    let activeSlide = document.getElementsByClassName('swiper-slide-next')[0];

    for(var i = 0; i < allSlides.length;i++) {
      allSlides[i].classList.remove('active-character')
      if (allSlides[i] == activeSlide) allSlides[i].classList.add('active-character');
    }
  }

  ionViewDidLoad() {
    this.slides.ionSlideWillChange.subscribe(() => {
      let activeIndex = this.slides.getActiveIndex();
      if (!this.sliderLoaded) setTimeout(() => {
        this.sliderLoaded = true;
      }, 500);
      if (this.persons[activeIndex]) this.activePerson = this.persons[activeIndex];
      if (activeIndex !== this.slides.length() - 2) this.changeSlider();
    });

    console.log('ionViewDidLoad UndercoverCharacterPage');
  }

  ionViewDidEnter() {
    this.splash.hide();
    this.toolsPrvd.hideLoader();
    //if (this.storage.get('first_time_hero') === null)
      //this.firstTimeHero = true;
    // this.slideAvatarPrvd.changeCallback = this.changeCallback.bind(this);
    //this.slideAvatarPrvd.sliderInit(this.pageTag);
    //this.slideAvatarPrvd.setSliderPosition('right');
  }

}
