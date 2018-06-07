import { Injectable } from '@angular/core';
import { NavController, IonicPage, App } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class VideoService {

  public playIntervalStep:number = 20;

  constructor(
    public app: App
  ) {

    this.app.viewWillLeave.subscribe(view => {
      // console.log('[VideoService] viewWillLeave view:', view);
      if (view['_cssClass'] == 'ion-page' && view.instance.pageTag) {
        this.stopAllVideos(<HTMLElement>document.querySelector(view.instance.pageTag));
      }
    });
  }

  public messageSliderChange(event:any, pageTag:string):void {
    let activePage = document.querySelector(pageTag);
    let parentSlider = activePage.querySelector('.' + event.slideId);
    let currentSlide = parentSlider.querySelectorAll('ion-slide.swiper-slide')[event.realIndex];
    let video = currentSlide.querySelector('video');
    let videos = parentSlider.querySelectorAll('video');
    for (let i = 0; i < videos.length; i++) this.pauseVideo(videos[i]);
    if (video) this.playVideo(video);
  }

  public posterAllVideos(targetDOM:HTMLElement):any {
    console.log('[VideoService] posterAllVideos');
    let allVideos = targetDOM.querySelectorAll('video');
    console.log('allVideos:', allVideos);
    if (allVideos.length == 0) {
      console.info('[VideoService] No videos in messages. Exiting...'); return;
    }
    let videos = [];
    for (let v = 0; v < allVideos.length; v++) {
      if (allVideos[v].getAttribute('poster') == 'null') videos.push(allVideos[v]);
    }
    if (videos.length == 0) {
      console.info('[VideoService] All videos have poster. Exiting...'); return;
    }
    let i = 0;
    let parseVideo = () => {
      let startTime = videos[i].currentTime;
      let playInt;
      videos[i].muted = true;
      this.playVideo(videos[i]);
      playInt = setInterval(() => {
        if (videos[i].currentTime != startTime) {
          this.pauseVideo(videos[i]);
          clearInterval(playInt);
          i++;
          if (i < videos.length) parseVideo();
        }
      }, this.playIntervalStep);
    }
    parseVideo();

  }

  public stopAllVideos(targetDOM:HTMLElement):void {
    let videos = targetDOM.querySelectorAll('video');
    for (let i = 0; i < videos.length; i++) {
      if (!videos[i].paused) this.pauseVideo(videos[i]);
    }
  }

  public toggleVideoVolume(event:any):void {
    // console.log('video click event:', event);
    if (event.target.tagName.toLowerCase() == 'video') {
      event.target.muted = !event.target.muted;
      let icon = event.target.parentElement.querySelector('.icon');
      if (icon){
        this.setIconType(event.target, icon);
        if (icon.style.opacity != '1') icon.style.opacity = '1';
        this.fadeOutIcon(event.target, icon);
      }
    }
  }

  public isInViewport(element:HTMLVideoElement):boolean {
    let rect = element.getBoundingClientRect();
    let html = document.documentElement;
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || html.clientHeight) &&
      rect.right <= (window.innerWidth || html.clientWidth)
    );
  }

  private setIconType(video:HTMLVideoElement, icon:HTMLElement):void {
    let type = video.muted ? 'off' : 'up';
    icon.classList.remove('ion-ios-volume-off-outline');
    icon.classList.remove('ion-ios-volume-up-outline');
    icon.setAttribute('md', 'ios-volume-' + type + '-outline');
    icon.setAttribute('ios', 'ios-volume-' + type + '-outline');
    icon.classList.add('ion-ios-volume-' + type + '-outline');
  }

  private fadeOutIcon(video:HTMLVideoElement, icon:HTMLElement):void {
    if (video.getAttribute('data-timeout'))
      clearTimeout(parseInt(video.getAttribute('data-timeout')));
    let to = setTimeout(() => {
      icon.style.opacity = '0';
    }, 2000);
    video.setAttribute('data-timeout', to.toString());
  }

  public toggleVideoPlay(targetDOM:HTMLElement):void {
    let videos = targetDOM.querySelectorAll('video');
    for (let i = 0; i < videos.length; i++) {
      if (!this.isInViewport(videos[i]) && !videos[i].paused) {
        this.pauseVideo(videos[i]);
      } else if (this.isInViewport(videos[i]) && videos[i].paused) {
        this.playVideo(videos[i]);
      }
    }
  }

  private pauseVideo(video:HTMLVideoElement):void {
    if (video) {
      video.pause();
      video.muted = true;
    }
    let icon = <HTMLElement>(video.parentElement.querySelector('.icon'));
    if (icon) {
      this.setIconType(video, icon);
      icon.style.opacity = '0';
    }
  }

  private playVideo(video:HTMLVideoElement):void {
    if (video) video.play();
    let icon = <HTMLElement>(video.parentElement.querySelector('.icon'));
    if (icon) {
      this.setIconType(video, icon);
      icon.style.opacity = '1';
      this.fadeOutIcon(video, icon);
    }
  }
}
