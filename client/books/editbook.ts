/// <reference path="../../typings/angular2-meteor.d.ts" />
/// <reference path="../../typings/book.d.ts" />
/// <reference path="../../typings/global.d.ts" />

import {Component, Inject, ElementRef, NgZone} from 'angular2/core'
import {FormBuilder, ControlGroup, Validators, FORM_DIRECTIVES, NgIf} from 'angular2/common';
import {Router, RouteParams} from 'angular2/router'

import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from 'client/globalsetting'

import {MeteorComponent} from 'angular2-meteor';

import {LocalBooks, LocalRecords} from 'collections/books'
import {PaipanEmitter} from 'client/allgemein/paipanermitter'

import {saveAs} from 'client/lib/FileSaver'

declare var jQuery;
declare var SQL

@Component({
    selector: "book-edit",
    pipes:[TranslatePipe],
    templateUrl: "client/books/editbook.html",
    directives: [FORM_DIRECTIVES, NgIf]
})

export class BookEditor{
    emitterBack = PaipanEmitter.get(PaipanEmitter.BackButton);

    private book: Book;
    Name: string;
    Desc: string;
    Author: string;
    Modified: string;

    Loaded = false;

    constructor(private router: Router,
                private routeParams: RouteParams,
                private rootElement: ElementRef,
                private ngZone: NgZone,
                @Inject(GlobalSetting) public glsetting:GlobalSetting) {
        //document.addEventListener("backbutton", this.onBackButton, false);
    }
    
    ngOnDestroy(){
        //document.removeEventListener("backbutton", this.onBackButton, false);
    }

    /*private onBackButton = (evt: Event) => {
        this.goBack()
    }*/
    
    get IsCloud(){
        return this.book ? this.book.cloud : false
    }
    
    get IsNew(){
        return !this.book;
    }
    
    ngOnInit(){
        let id = this.routeParams.params['id']
        this.book = LocalBooks.findOne({_id: id})
        if(this.book){
            this.Name = this.book.name;
            this.Desc = this.book.description;
            this.Author = this.book.author;
            this.Modified = this.toChina(new Date(this.book.modified))
        }else{
            this.Name = ''
            this.Desc = ''
            this.Author = ''
            this.Modified = ''
        }
        
        this.Loaded = true;
        jQuery(this.rootElement.nativeElement)
            .find('.message .close')
            .on('click', function() {
                jQuery(this)
                  .closest('.message')
                  .transition('fade');
            });
    }

    goBack(){
        this.router.parent.navigate(['./List']);
    }
    
    saveBook(){
        if(!this.Name || this.Name == ''){
            this.glsetting.Alert("保存书集", "请给您的新书一个名字。")
            return
        }
        
        
        if(this.book){
            this.updateBook();
        }else{
            this.addBook();
        }
    }
    
    pushCloud(){
        if(!this.glsetting.Signed){
            this.glsetting.Alert("推送云端", "您还没有登录，无法将书集推送云端。")
            return;
        }

        if(this.book.cloud == true){
            let bkmanager = this.glsetting.BookManager;
            bkmanager.UploadBook(this.book._id)
                .then((res) => {
                    if(res == true){
                        this.glsetting.Notify("更新成功!", 1)
                    }else{
                        this.glsetting.Alert("推送云端", "更新失败!")
                    }
                })

            return
        }
    
        let msg = "一旦转为云书集， 则不可以转为纯本地书集。要将此书集推送到云端吗？"
        this.glsetting.Confirm("推送云端", msg, () => {
            let bkmanager = this.glsetting.BookManager;
            bkmanager.UploadBook(this.book._id)
                .then((res) => {
                    if(res == true){
                        this.book.cloud = true
                        this.glsetting.Notify("更新成功!", 1)
                    }else{
                        this.glsetting.Alert("推送云端", "更新失败!")
                    }
                })
        }, null)
    }
    
    cleanLocal(){
       let msg = "如果打算长时间不读此书，可以将保存在本地的记录清空，以节省空间。将来有需要的时候，再次从云端拉取。您确定要清空此书的本地记录吗？"
        this.glsetting.Confirm("清空本地", msg, () => {
            LocalRecords.remove({book: this.book._id})
        }, null) 
    }

    exportBook(){
        let db = new SQL.Database();
        // Run a query without reading the results
        db.run("CREATE TABLE t_fuzhu (ID, CHARACTER, GUAID);");
        db.run("CREATE TABLE t_guali (ID, CONTENT);")

        let time = new Date(this.book.created)
        db.run("INSERT INTO t_fuzhu VALUES (?,?,?)", [1, this.Name, null])
        db.run("INSERT INTO t_fuzhu VALUES (?,?,?)", [2, time.formate("datetime"), null])
        db.run("INSERT INTO t_fuzhu VALUES (?,?,?)", [3, this.Author, null])
        db.run("INSERT INTO t_fuzhu VALUES (?,?,?)", [7, 'Booktype', 3])
        db.run("INSERT INTO t_fuzhu VALUES (?,?,?)", [20, this.Desc, null])
        db.run("INSERT INTO t_fuzhu VALUES (?,?,?)", [21, this.book._id, null])

        let rds = LocalRecords.find({book: this.book._id}).fetch()
        for(let id = 0; id < rds.length; id++){
            let rd = JSON.stringify(rds[id])
            db.run("INSERT INTO t_guali VALUES (?,?)", [id + 1, rd])
        }

        var binaryArray = db.export();
        var blob = new Blob([binaryArray.buffer])
        saveAs(blob, this.book.name + '.db')
    }
    
    private addBook(){
        LocalBooks.insert({
            name: this.Name,
            description: this.Desc,
            icon: null,
            author: this.Author,
            owner: Meteor.userId(),
            readpermission: 0,
            writepermission: 0,
            created: Date.now(),
            modified: Date.now(),
            readed: Date.now(),
            cloud: false,
            deleted: false,
            public: false
        }, (err, id) => {
            if(err){
                jQuery('.negative.editbook.message').transition('fade')
            }else{
                jQuery('.positive.editbook.message').transition('fade')
                this.ngZone.run(() => {
                    this.book = LocalBooks.findOne({_id: id})
                    console.log("saveBook", id)
                })
            }
        });
    }
    
    private updateBook(){
        this.Loaded = false
        LocalBooks.update(this.book._id, {
            $set: {
                name: this.Name,
                description: this.Desc,
                author: this.Author,
                modified: Date.now(),
                readed: Date.now()
            }
        }, (err, res) => {
            this.ngZone.run(() => {
                this.Loaded = true;
            })

            if(err){
                jQuery('.negative.editbook.message').transition('fade')
            }else{
                jQuery('.positive.editbook.message').transition('fade')
            }
        })
    }
    
    private toChina(d: Date): string{
        let res = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日 " + d.getHours() + "时" + d.getMinutes() + "分";
        return res;
    }
}