$(function(){
      Note = Backbone.Model.extend({
                                       defaults : {
                                           title : '',
                                           done: false
                                       },
                                   });

      Notes = Backbone.Collection.extend({
                                             localStorage: new Backbone.LocalStorage("notes"),
                                             model: Note,
                                             comparator: "done",
                                             initialize:function() {
                                                 this.on("change:done", this.sort);
                                             },
                                         })
      
      NoteView = Backbone.View.extend({
                                          className: "note",
                                          events: {
                                              "click .close" : "onclick_close",
                                              'change input.done' : 'onclick_done',
                                              'dblclick span.title': 'onclick_title',
                                              'keydown input.title':'onkey_title',
                                              'blur input.title':'onblur_title'
                                          },
                                          template: _.template($("#note-template").html()),

                                          initialize: function() {
                                              this.model.view = this
                                              this.listenTo(this.model, "change", this.onchange)
                                              this.listenTo(this.model, "destroy", function(){this.$el.remove()})
                                              this.render()
                                          },
                                          
                                          render: function() {
                                              this.$el.attr({id: this.model.id})
                                              if (this.model.get("done"))
                                                  this.$el.addClass("done")
                                              else
                                                  this.$el.removeClass("done")
                                              this.$el.html(this.template(this.model.attributes))
                                              return this;
                                          },
                                          onclick_close: function() {
                                              //console.log(arguments);
                                              this.model.destroy({wait:true})
                                          }, 
                                          onclick_title: function(){
                                              //console.log(arguments);
                                              this.$el.addClass("editing")
                                              this.$('input.title').focus()
                                          },
                                          onkey_title: function(event) {
                                              if(event.keyCode == 13) {
                                                  //console.log(arguments);
                                                  this.commit_edit_title()
                                              }
                                          },
                                          onblur_title: function() {
                                              this.commit_edit_title();
                                          },
                                          onclick_done:function(e) {
                                              this.model.set('done', e.target.checked)
                                          },
                                          onchange: function() {
                                              //console.log(arguments);
                                              this.model.save(this.model.changed)
                                              this.render();
                                          },
                                          commit_edit_title: function() {
                                              newval = this.$('input.title')[0].value
                                              oldval = this.model.get("title")
                                              if (newval != oldval){
                                                  this.model.set("title", newval)
                                              }
                                              this.$el.removeClass("editing")
                                          },

                                      })
      
      
      NotesView = Backbone.View.extend({
                                           events: {
                                               "click" : "onclick",
                                               "keydown input.new": "newNote"
                                           },

                                           template_header: _.template($("#notes-header").html()),
                                           template_footer: _.template($("#notes-footer").html()),

                                           initialize: function() {
                                               this.collection.fetch();
                                               this.listenTo(this.collection, "add", this.on_add);
                                               this.listenTo(this.collection, "remove", this.on_remove);
                                               this.listenTo(this.collection, 'sort', this.on_sort)
                                               this.render();
                                           },
                                           render_header:function(){
                                               this.$("#header").html(this.template_header())
                                           },
                                           render_main:function(){
                                               this.$("#main .note").remove()
                                               _.each(this.collection.models, function(m){
                                                         //console.log(m)
                                                         this.on_add(m);
                                                         }, this);
                                           },
                                           render_footer: function() {
                                               this.$("#footer").html(this.template_footer({total:this.collection.length, todo:this.collection.countBy("done")[false], done:this.collection.countBy("done")[true]}))
                                           },
                                           render:function() {
                                               this.render_header();
                                               this.render_main();
                                               this.render_footer();
                                           },
                                           on_sort: function() { // sort all note view
                                               this.render();
                                           },
                                           on_add: function(m){
                                               this.$("#main").append(new NoteView({model:m}).$el)
                                           },
                                           on_remove:function(m){
                                               // no need to render main since destroy remove noteview automatically
                                               //update  footer statistic datan
                                              this.render_footer();
                                           },
                                           newNote:function(e) {
                                               if(e.keyCode == 13) {
                                                  //console.log(arguments);
                                                   this.collection.create({title:e.target.value})
                                                   $('input.new').focus()
                                              }
                                           }
                                           
                                       })
      notes = new Notes()
      notesView = new NotesView({collection:notes, el: $('#container')});
  })
