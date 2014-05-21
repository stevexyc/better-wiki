Wiki = new Meteor.Collection("wiki");
Meteor.subscribe("Link-List");
Links = new Meteor.Collection("links");
// declare vars
var editor, newItemEditor;
Session.set('edit_id',null);
Session.set('delete_id',null);

Router.map(function () {
  this.route('index', {
    path: '/',
    waitOn: function () {
      return Meteor.subscribe('Terms');
    },
    template: 'index',
    layoutTemplate: 'appWrap',
    action: function () {
      if (this.ready())
        this.render();
      else
        this.render('loading');
    }
  });
  this.route('index', {
    path: '/index',
    waitOn: function () {
      return Meteor.subscribe('Terms');
    },
    template: 'index',
    layoutTemplate: 'appWrap',
    action: function () {
      if (this.ready())
        this.render();
      else
        this.render('loading');
    }
  });
  this.route('index', {
    path: '/additem',
    waitOn: function () {
      return Meteor.subscribe('Terms');
    },
    template: 'additem',
    layoutTemplate: 'appWrap',
    action: function () {
      if (this.ready())
        this.render();
      else
        this.render('loading');
    }
  });
  this.route('page', {
    path:'/:slug',
    waitOn: function () {
      return Meteor.subscribe('Terms');
    },
    template: 'page',
    layoutTemplate: 'appWrap',
    data: function () {
      return Wiki.findOne({slug:this.params.slug})
    },
    action: function () {
      if (this.ready())
        this.render();
      else
        this.render('loading');
    }
  });
});

//global typeahead function
substringMatcher = function() {
  var strs = Wiki.find().fetch().map(function (it) { return it.name; });
  return function findMatches(q, cb) {
    var matches, substringRegex;
    // an array that will be populated with substring matches
    matches = [];
    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');
    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });
    cb(matches);
  };
};


Template.topBar.rendered = function () {
  Meteor.typeahead($('#searchbar'));
}

Template.topBar.terms = function () {
  return Wiki.find().fetch().map(function (it) { return it.name; });
}

Template.topBar.events({
  'click #menu-toggle': function () {
    $('#menu-wrap').toggleClass('hide-menu');
  },
  'focus #searchbar': function () {
    $('.searchbox').addClass('blue');
    Deps.flush();
    Deps.afterFlush(function () {
      $('#searchbar').select();
    })
  },
  'blur #searchbar': function () {
    $('.searchbox').removeClass('blue');
  },
  'keyup #searchbar': function (e,t) {
    if (e.which === 13) {
      console.log('13')
      var searchtext = $('#searchbar').val();
      if (searchtext.trim().length > 0) {
        var wikiItem = Wiki.findOne({name:searchtext});
        if (wikiItem) {
          // console.log(wikiItem.slug);
          Router.go('/'+wikiItem.slug);
        };
      };
      $('#searchbar').blur();
    };
  },
  'click .fa-plus': function () {
    Router.go('/additem');
  }
});

Template.zmenu.rendered = function () {
  this.$('#page-menu').sortable({
    items: ">li:not(.add-to-menu)",
    stop: function (event, ui) {
      var el = ui.item.get(0);
      var before = ui.item.prev().get(0);
      var after = ui.item.next(':not(.add-to-menu)').get(0);

      var newRank;
      if (!before) { // moving to the top of the list
        newRank = calcRank.beforeFirst(UI.getElementData(after).order);

      } else if (!after) { // moving to the bottom of the list
        newRank = calcRank.afterLast(UI.getElementData(before).order);

      } else {
        newRank = calcRank.between(
          UI.getElementData(before).order,
          UI.getElementData(after).order
        );
      }
      Meteor.call('updateLinkOrder', UI.getElementData(el)._id, newRank);
      console.log(newRank);
    }
  })
}

Template.zmenu.linklist = function () {
  // SORT by order 
  return Links.find({}, {sort:{order:1}});
};

Template.zmenu.current = function (slug) {
  if (slug) {
    if ( ('/'+slug) === Router.current().path) {
      return 'current';
    };
  } else {
    if (this.slug === Router.current().path) {
      return 'current';
    } else if ( ('/' + this.slug) === Router.current().path) {
      return 'current';
    }
  }
}


Template.zmenu.events({
  'click #add-link': function (e,t) {
    var parent = $(e.target).parent();
    var $newinput = $('<input type="text" class="add-link"/>');
    $(parent).html($newinput);
    $newinput.typeahead({
              hint: true,
              highlight: true,
              minLength: 1,
            },{
              name: 'terms',
              displayKey: 'value',
              source: substringMatcher()
            });
    $newinput.focus();
  },
  'keyup .add-link': function (e,t) {
    if (e.which === 13) {
      var target = $(e.target);
      var newlinkname = target.val();
      var slug = generateSlug(newlinkname);
      var count = $('.sub-lvl-link').length + 1;
      if (slug.length !== 0) {
        Meteor.call('addLink',newlinkname,slug,count);
      };
      target.blur();
    };
  },
  'blur .add-link': function (e,t) {
    var parent = $(e.target).parent();
    parent.html('<a href="#" id="add-link"><i class="fa fa-plus-circle"></i> new link</a>');
  },
  'click .delete-link': function (e,t) {
    console.log(this._id);
    Meteor.call('deleteLink',this._id);
  },
  'click #test': function () {
    // saveMenu();
  }
});

Template.index.item = function () {
  return Wiki.find({},{sort:{name: 1}});
};

Template.zitem.being_edited = function () {
  return Session.equals('edit_id', this._id);
}

Template.zitem.events ({
  'click a': function (e,t) {
    e.preventDefault();
    if (Session.equals('edit_id',null)) {
      var self = $(e.target);
      // console.log(self);
      if (self.attr('target') === '_blank') {
        window.open(self.attr('href'),'_blank');
      } else {
        if (self.parent().hasClass('sxc') && (self.siblings().size() > 0)) {
            var def = self.next('.panel');
            def.toggleClass('hide');
        } else {
          //wrap the link
          self.wrap("<span class='sxc'></span>");
          var name = self[0]['attributes']['href']['textContent'];
          var parent = self.parent()[0];
          UI.insert(UI.renderWithData(Template.inneritem, {zname: name}), parent);
        }
      }
    };
  },
  'click .edit-btn': function (e,t) {
    // set edit_id to current item
    Session.set('edit_id', this._id);
    // destroy other editing items
    if (typeof editor != 'undefined') {
      editor.deactivate();
      delete window.editor;
    };
    // destroy inner panels
    var thispanel = $(e.target).parent().next('.panel');
    thispanel.find('.panel').remove();
    // remove all instances of span.sxc 
    thispanel.find('.sxc a').unwrap();
    // create editor
    editor = new MediumEditor(thispanel, {
      buttons: ['bold','italic','underline','anchor','orderedlist','unorderedlist'],
      buttonLabels: 'fontawesome',
      cleanPastedHTML: true,
      forcePlainText: true,
      targetBlank: true,
    });
  },
  'click .save-btn': function (e,t) {
    // set edit_id to null
    Session.set('edit_id', null);
    // destroy inner panels
    var thispanel = $(e.target).parent().next('.panel');
    thispanel.find('.panel').remove();
    // unwrap all instances of span.sxc 
    thispanel.find('.sxc a').unwrap();
    // get the name 
    // var name = this.name;
    var zname = $('#'+this._id+' .edit-title').val().trim();
    var name = zname.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ');
    console.log('name: '+name);
    // get the slug 
    var originalslug = this.slug;
    // var slug = name.replace(/ /g,'-').toLowerCase();
    var slug = generateSlug(name);
    console.log('slug: '+slug);
    // get the new text
    var textobj = editor.serialize();
    var text = textobj['element-0']['value'];
    console.log(text);
    // update database by calling updateItem method
    Meteor.call('updateItem', this._id, name, slug, text);
    // destroy medium-editor
    editor.deactivate();
    if (originalslug !== slug) {
      Router.go('/'+slug);
    };
  },
  'click .fa-times': function (e,t) {
    Session.set('delete_id', this._id);
  }
});

Template.inneritem.getitem = function (name) {
  return Wiki.findOne({name:name});
}

Template.additem.rendered = function () {
  var thispanel = this.find('.panel')
  newItemEditor = new MediumEditor(thispanel, {
      buttons: ['bold','italic','underline','anchor','orderedlist','unorderedlist'],
      buttonLabels: 'fontawesome',
      cleanPastedHTML: true,
      forcePlainText: true,
      targetBlank: true,
    });
}

Template.additem.events({
  'click .fa-save': function (e,t) {
    // destroy inner panels
    var thispanel = $(e.target).parent().next('.panel');
    thispanel.find('.panel').remove();
    // unwrap all instances of span.sxc 
    thispanel.find('.sxc a').unwrap();
    // get the name 
    var zname = $('#add-item-title').val().trim();
    var name = zname.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ');
    console.log('name: '+name);
    // get the slug
    var slug = generateSlug(name);
    console.log('slug: '+slug);
    // get the new text
    var textobj = newItemEditor.serialize();
    var text = textobj['element-0']['value'];
    console.log(text);
    // add new item to database
    Meteor.call('newItem', name, slug, text);
    newItemEditor.deactivate();
    Router.go('/'+slug);
  },
  'click a': function (e,t) {
    e.preventDefault();
  }
});

Template.actionbar.showConfirm = function () {
  if (!Session.equals('delete_id', null)) {
    return 'show-confirm'
  };
}

Template.actionbar.itemName = function () {
  if (!Session.equals('delete_id', null)) {
    return Wiki.findOne({_id:Session.get('delete_id')}).name
  };
}

Template.actionbar.events({
  'click .confirm-cancel': function (e,t) {
    Session.set('delete_id', null);
  },
  'click .confirm-delete': function (e,t) {
    Meteor.call('deleteItem', Session.get('delete_id'));
    Session.set('delete_id', null);
  }
})

var saveMenu = function () {
  Deps.flush();
  var allLinks = $('.top-lvl-list > a').map(function (index) {
    var obj = {};
    var sublinks = $(this).siblings('.sub-lvl-list').find('a');
    obj.id = $(this).parent().attr('id');
    obj.title = $(this).text();
    obj.slug = $(this).attr('href').substr(1);
    obj.order = index;
    obj.links = sublinks.map(function (index) {
      var sublink = {};
      sublink.title = $(this).text();
      sublink.slug = $(this).attr('href').substr(1);
      return sublink;
    }).get();
    return obj;
  }).get();
  console.log(allLinks);
  for (var i = 0; i < allLinks.length; i++) {
    console.log(allLinks[i]);
    Meteor.call('updateMenu',allLinks[i]);
  };
  // ultimately i need [{},{},{}]
}

var generateSlug = function (text) {
  return text.trim().replace(/ /g,'-').toLowerCase();
}

var calcRank = {
  beforeFirst: function (firstRank) {
    return firstRank -1;
  },
  between: function (beforeRank, afterRank) {
    return (beforeRank + afterRank) / 2;
  },
  afterLast: function (lastRank) {
    return lastRank + 1;
  }
};



