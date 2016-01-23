/// <reference path="../../typings/angular2-meteor.d.ts" />
/// <reference path="../../typings/book.d.ts" />

import {Component, Inject, NgZone} from 'angular2/core'
import {NgFor} from 'angular2/common'
import {Router, RouteParams} from 'angular2/router'

import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from 'client/globalsetting'

import {Books} from 'collections/books'

declare var jQuery;

@Component({
    selector: "book-market",
    pipes:[TranslatePipe],
    templateUrl: "client/books/bookmarket.html",
    directives: [NgFor]
})
export class BookMarket{
    private books: Array<BookView>;
    Market = 'private'
    
    glsetting:GlobalSetting;
    constructor(private router: Router,
                private routeParams: RouteParams,
                private ngZone: NgZone,
                @Inject(GlobalSetting) glsetting:GlobalSetting) {
        this.glsetting = glsetting;
    }
    
    get Books(){
        return this.books;
    }
    
    showMenu(hide) {
        if(hide === true){
            jQuery(document).find('.ui.labeled.sidebar').sidebar('hide')
        }else{
            jQuery(document).find('.ui.labeled.sidebar').sidebar('toggle');
        }
    } 
    
    ngOnInit() {
        let hideMenu = true;
        this.showMenu(hideMenu);
        this.loadBooks();
    }
    
    deleteBook(book: BookView){
        jQuery('.delete.book.modal')
        .modal({
            closable  : false,
            onDeny    : function(){
            },
            onApprove : () => {
              Books.remove(book.Id);
              this.loadBooks();
            }
        })
        .modal('show')
    }
    
    editBook(book: BookView){
        if(book){
            this.router.parent.navigate(['./EditBook', {id: book.Id}])
        }else{
            this.router.parent.navigate(['./EditBook', {id: null}])
        }
    }
    
    openBook(book: BookView){
        let bookid = book.Id ? book.Id : ''
        this.router.parent.navigate(['./BookContent', {id: bookid}])
    }
    
    private loadBooks(){
        //let tmp = Books.find().fetch()

        this.books = [];
        let localbook = {
            _id: null,
            name: '本地记录',
            description: '同时保存卦例、八字等排盘记录。本地记录只能被当前移动设备访问。',
            icon: null,
            owner: null,
            readpermission: 0,
            writepermission: 0,
            author: null,
            created: this.glsetting.GetSetting('created'),
            modified: this.glsetting.GetSetting('modified'),
            public: false
        }
        
        this.books.push(new BookView(localbook));

        Meteor.subscribe('books', () => {
            let tmp = Books.find().fetch();
            for(let b of tmp){
                this.books.push(new BookView(b))
            }
            
            this.ngZone.run(() => {})
        });
    }
}

class BookView{
    constructor(private book: Book){
        
    }
    
    get Id(){
        return this.book._id;
    }
    
    get Name(){
        return this.book.name;
    }
    
    get Desc(){
        return this.book.description;
    }
    
    get Author(){
        let res = this.book.author ? this.book.author : '';
        res = res.trim();
        return res == '' ? '当前用户' : res;
    }
    
    get IsCloud(){
        return this.book._id != null;
    }
    
    get Editable(){
        return this.book._id != null;
    }
    
    get Created(){
        let date = this.book.created ? new Date(this.book.created) : new Date(Date.now())
        return this.toChina(date);
    }
    
    get Modified(){
        let date = this.book.modified ? new Date(this.book.modified) : new Date(Date.now())
        return this.toChina(date);
    }
    
    private toChina(d: Date): string{
        let res = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
        return res;
    }
}