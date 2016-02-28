/// <reference path="../../../typings/angular2-meteor.d.ts" />
/// <reference path="../../../typings/global.d.ts" />

import {Component, Inject, ElementRef} from 'angular2/core'
import {NgFor} from 'angular2/common'
import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'
import {GanZhi, ZhiNames} from "../../../lib/base/ganzhi";

import {SemanticSelect, tyoption} from 'client/allgemein/directives/smselect'

declare var jQuery:any;

@Component({
    selector: 'pailiuyao-time',
    pipes: [TranslatePipe],
    templateUrl: 'client/liuyao/paipan/pailiuyaotime.html',
    directives: [NgFor, SemanticSelect]
})

export class PailiuyaoTime{
    private rootElement: ElementRef;
    private ganzhiModel = false;
    private ganzhinames: tyoption;
    private ganzhinamesfull: tyoption;
    
    glsetting:GlobalSetting;
    InputTime = {
        Date: '',
        Time: '',
        HH: 0,
        MM: 0,
        Yue: '',
        Ri: ''
    }
    
    constructor(@Inject(GlobalSetting) glsetting:GlobalSetting, elementRef: ElementRef) {
        this.glsetting = glsetting;
        this.rootElement = elementRef;
    }
    
    get Result(): any{
        if(this.GanZhiModel === true){
            return [this.InputTime['Yue'], this.InputTime['Ri']];
        }else{
            let date = new Date(this.InputTime['Date'])
            //let time = this.InputTime.Time.split(':')
            //let houre = parseInt(time[0])
            //let minute = parseInt(time[1])
            let houre = this.InputTime.HH;
            let minute = this.InputTime.MM;
            let res = new Date(date.getFullYear(), date.getMonth(), date.getDate(), houre, minute)
            return res.toISOString()
        }
    }
    
    get GanZhiModel(){
        return this.ganzhiModel;
    }
    
    set GanZhiModel(value){
        this.ganzhiModel = value;
        if(value == true){
            this.showAnimate('paigua-time-gl', 'paigua-time-gz');
        }else{
            this.showAnimate('paigua-time-gz', 'paigua-time-gl');
        }
    }

    get GanZhiNames() {
        if(!this.ganzhinames){
            //this.ganzhinames = [].concat(GanZhi.GanZhiNames);
            this.ganzhinames = {Items: []}
            this.ganzhinames.Items = GanZhi.GanZhiNames.map(gz => {
                return {Value: gz, Text: gz}
            })
        }

        return this.ganzhinames;
    }

    get GanZhiNamesFull() {
        if(!this.ganzhinamesfull){
            this.ganzhinamesfull = {Items: []}
            let tmp = ZhiNames().concat(GanZhi.GanZhiNames);
            this.ganzhinamesfull.Items = tmp.map(gz => {
                return {Value: gz, Text: gz}
            })
        }

        return this.ganzhinamesfull
    }

    ngOnInit(){
        let time = new Date(Date.now())
        let dateText = time.formate('date');
        let timeText = time.formate('time');

        this.InputTime = {
            Date: dateText,
            Time: timeText,
            HH: time.getHours(),
            MM: time.getMinutes(),
            Yue: '子',
            Ri: '甲子'
        }
        
        //let domTime = jQuery('#paigua-time-gl')
        let domTime = jQuery(this.rootElement.nativeElement).find('#paigua-time-gl')
        this.ganzhiModel = domTime.hasClass('hidden') ? true : false;
    }

    ngAfterViewInit(){
        //console.log('After pailiuyao time view init')
    }
    
    private showAnimate(outId: string, inId: string){
        jQuery(this.rootElement.nativeElement).find('#' + outId).transition('fade left', function(){
            jQuery('#' + inId).transition('fade right');
        });
    }
}