/// <reference path="../../typings/angular2-meteor.d.ts" />
/// <reference path="../../typings/global.d.ts" />

import {Component, Inject} from 'angular2/core'
import {NgFor} from 'angular2/common'

import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from  'client/globalsetting'

import {TYLunar, TYDate} from 'lib/lunar/tylunar';
import {LandMaps} from 'lib/lunar/landmaps';
import {SemanticSelect} from 'client/allgemein/directives/smselect'

@Component({
    selector: 'calendarview',
    templateUrl: 'client/calendar/calendar.html',
    pipes: [TranslatePipe],
    directives: [NgFor, SemanticSelect],
    styles: [`
        .column.th.cell{
            text-align:center;
            padding-left:0;
            padding-right:0;
            border: 1px solid darkgrey;
        }
        .th.cell.weekday{
            background-color:#cdc8b1;
        }
        .th.cell.weekend{
            background-color:chocolate
        }
        .month.column.cell.td{
            text-align:center;
            padding:0;
            border: 1px solid darkgrey;
        }
        .column.cell.month{
            background-color:#eee9e9;
            color: black
        }
        .column.cell.xmonth{
            background-color:#fffafa;
            color: gray
        }
        .column.cell.active{
            background-color:#6495ed;
            color: black
        }
    `]
})

export class CalendarView {
    glsetting: GlobalSetting;
    Weeks: Array<TYDate> = [];
    Month: number;
    Date: number;
    Year: number;
    Good:string = '';
    Bad:string = '';
    Jianchu: string = '';
    BadDay:string = '';
    NlSearch:Object;
    searchModel = false;

    private tyDate:TYDate;
    private selectedDate: string;
    private inited = false;

    constructor(@Inject(GlobalSetting) glsetting: GlobalSetting){
        this.glsetting = glsetting;
        let date = new Date(Date.now());
        this.initWeeks(date.getFullYear(), date.getMonth() + 1, date.getDate());
        this.inited = true;

        let d = new Date(Date.parse('2015-10-24'))
        console.log(d.toString())
    };
    
    get SelectedDate(): string{
        return this.selectedDate;
    }
    
    set SelectedDate(value: string) {
        if(this.inited == false || value == ''){
            return;
        }
    
        this.selectedDate = value;

        //let d = Date.fromText(value)
        let d = new Date(Date.parse(value))
        if(d.getFullYear() != this.Year || d.getMonth() + 1 != this.Month || d.getDate() != this.Date){
            this.initWeeks(d.getFullYear(), d.getMonth() + 1, d.getDate());
        }
    }

    get TyDate(){
        return this.tyDate;
    }

    set TyDate(value){
        this.tyDate = value;
        this.initDetail();
    }

    // 更改当前日期
    changeDate(date: TYDate){
        let now = new Date(Date.now());
        let y = date ? date.Year : now.getFullYear();
        let m = date ? date.Month : now.getMonth() + 1;
        let d = date ? date.Date : now.getDate();
    
        if(m == this.Month && date){
            this.Date = d;
            this.TyDate = date;

            this.SelectedDate = date.date.formate('date')
        }else{
            this.initWeeks(y, m, d)
        }
    }

    // 显示设置窗口
    showSetting(){
        console.log('calendar view: call from parent click')
    }

    searchNL(){
        var y = this.NlSearch['Year'];
        //var m = this.NlSearch['MonthOptions'].indexOf(this.NlSearch['Month']) + 1
        var m = parseInt(this.NlSearch['Month'].toString()) + 1
        var d = parseInt(this.NlSearch['Date'].toString()) + 1
        var leap = '';
        if(this.NlSearch['Leap'] === true){
            m = m * (-1);
            leap = '闰'
        }
console.log('search ..', y , m, d)
        let res = TYLunar.SearchNongli(y, m, d);
        if(res != null){
            let year = res.getFullYear();
            let month = res.getMonth() + 1;
            let date = res.getDate();

            this.NlSearch['Result'] = res.formate('date')
            this.NlSearch['ResultTX'] = year + '年 ' + month + '月 ' + date + '日'
            console.log(this.NlSearch['Result'])
        }else{
            this.NlSearch['ResultTX'] = '找不到农历 '
                + this.NlSearch['Year'] + '年 '
                + leap
                + TYLunar.M_ChineseMonthNames[this.NlSearch['Month']] + '月 '
                + TYLunar.M_DayNames[this.NlSearch['Date']]

            this.NlSearch['Result'] = '';
        }
    }

    // 计算某月开始第一天是周几。月的下标从1开始。
    private calcFirstDayInCalendarTable(year: number, month: number){
        var startDate = new Date(year, month - 1, 1);
        var dayInWeek = startDate.getDay();
        dayInWeek = (dayInWeek == 0) ? 7 : dayInWeek;

        var date = TYLunar.addDays(-1 * dayInWeek, startDate);
        return date;
    };

    // 初始化整个月份。月的下标从1开始。
    private initWeeks (year: number, month: number, _date: number) {
        var date = this.calcFirstDayInCalendarTable(year, month);
        let weeks = [];
        for (let w = 0; w < 6; w++) {
            let week = { Dates: [] };
            weeks.push(week);

            for (let d = 0; d < 7; d++) {
                let tyDate = new TYDate(date);
                week.Dates.push(tyDate);
                date = TYLunar.addDays(1, date);

                if(tyDate.Month == month && tyDate.Date == _date){
                    this.TyDate = tyDate;
                }
            }
        }

        this.Weeks = weeks;
        this.Month = month;
        this.Date = _date;
        this.Year = year;

        let d = new Date(year, month - 1, _date)
        this.SelectedDate = d.formate('date')
    };

    private initDetail(){
        let jianchu = this.tyDate.JianChu;
        this.Good = jianchu.Good;
        this.Bad = jianchu.Bad;
        this.Jianchu = jianchu.Titel + ': ' + jianchu.Mean;

        let temp = ''

        // 岁破, 月破
        temp = temp + (this.tyDate.IsSuiPo == true ? " 岁破" : '');
        temp = temp + (this.tyDate.IsYuePo == true ? " 月破" : '');
        temp = temp + (this.tyDate.IsShangSuo == true ? ' 上朔' : '')
        temp = temp + (this.tyDate.IsYangGong13 == true ? ' 杨公十三忌' : '')
        this.BadDay = temp.trim();
    }
    
    ngOnInit(){
        let date = new Date(Date.now());
        this.SelectedDate = date.formate('date');
        this.NlSearch={
            Year: date.getFullYear(),
            //MonthOptions:TYLunar.M_ChineseMonthNames,
            MonthOptions:TYLunar.M_ChineseMonthNames.join('月 '),
            DateOptions: TYLunar.M_DayNames.join(' '),
            Month:0,
            Date:0,
            Leap:false,
            Result: null,
            ResultTX: '',
        }
    }
}