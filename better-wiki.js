Links = new Meteor.Collection("links");

if (Meteor.isClient) {

  var editor;

  //global typeahead function
  substringMatcher = function() {
    var strs = Links.find().fetch().map(function (it) { return it.name; });
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

  Template.page.greeting = function () {
    return "In mathematics and theoretical physics, mirror symmetry is a relationship between two <span><span class='ink'>geometric objects</span></span> called Calabi–Yau manifolds. It can happen that two Calabi–Yau manifolds look very different geometrically but are nevertheless equivalent if they are employed as extra dimensions of string theory. In this case, the manifolds are called mirror manifolds.";
  };

  Template.page.events({
    'click .ink': function (e,t) {
      var self = $(e.target);
      if (self.siblings().size() > 0) {
        var def = self.next('.panel');
        def.toggleClass('hide');
      } else {
        var name = self.text();
        var obj = Links.findOne({name:name});
        $(e.target).after("<div class='panel'><b>"+name+": </b>"+obj.definition+"</div>");
      }
    },

    'click .edit-btn': function (e,t) {
      if (Session.equals('editing', true)) {

      } else {
        // Session.set('editing', true)
        // var editor = new MediumEditor('#main');
      }
    }

  });

  Template.items.item = function () {
    return Links.find();
  };

  Template.items.being_edited = function () {
    return Session.equals('edit_id', this._id);
  }

  Template.items.events ({
    'click a': function (e,t) {
      e.preventDefault();
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
    },
    'click .ink': function (e,t) {
      var self = $(e.target);
      if (self.siblings().size() > 0) {
        var def = self.next('.panel');
        def.toggleClass('hide');
      } else {
        var name = self.text();
        var parent = self.parent()[0];
        UI.insert(UI.renderWithData(Template.inneritem, {zname: name}), parent);
      }
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
      var name = this.name;
      // get the new text
      var textobj = editor.serialize();
      var text = textobj['element-0']['value'];
      console.log(text);
      // update database by calling updatetext method
      Meteor.call('updatetext', this._id, name, text);
      // destroy medium-editor
      editor.deactivate();
    },
    'click .test': function (e,t) {
      $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1,
      },{
        name: 'states',
          displayKey: 'value',
          source: substringMatcher()
      })
    }
  });

  Template.inneritem.getitem = function (name) {
    return Links.findOne({name:name});
  }

}

if (Meteor.isServer) {
  Meteor.methods({
    updatetext: function (id, name, text) {
      Links.upsert({_id:id},
        {
          name: name,
          definition: text
        }
      );
    }
  });

  Meteor.startup(function () {
    if (Links.find().count() === 0) {
      Links.insert(
        { name: "Topic 1",
          definition: "In mathematics and theoretical physics, mirror symmetry is a relationship between two <a href='geometric objects'>geometric objects</a> called Calabi–Yau manifolds. It can happen that two Calabi–Yau manifolds look very different geometrically but are nevertheless equivalent if they are employed as extra dimensions of string theory. In this case, the manifolds are called mirror manifolds."
        }
      );
      Links.insert(
        { name: "geometric objects",
          definition:"Take a look at some basic geometric objects: line, <a href='ray'>ray</a>, point, etc. Play with these geometric objects. Notice how they move.",
        }
      );
      Links.insert(
        { name: "ray",
          definition:"what is a ray? a ray is a line with a direction, think about lazers, that is what a ray is.",
        }
      );
    }
  });

}


  // Meteor.startup(function () {
  //   if (Links.find().count() === 0) {
  //     Links.insert(
  //       { name: "Topic 1",
  //         definition: "In mathematics and theoretical physics, mirror symmetry is a relationship between two <span><span class='ink'>geometric objects</span></span> called Calabi–Yau manifolds. It can happen that two Calabi–Yau manifolds look very different geometrically but are nevertheless equivalent if they are employed as extra dimensions of string theory. In this case, the manifolds are called mirror manifolds."
  //       }
  //     );
  //     Links.insert(
  //       { name: "geometric objects",
  //         definition:"Take a look at some basic geometric objects: line, <span><span class='ink'>ray</span></span>, point, etc. Play with these geometric objects. Notice how they move.",
  //       }
  //     );
  //     Links.insert(
  //       { name: "ray",
  //         definition:"what is a ray? a ray is a line with a direction, think about lazers, that is what a ray is.",
  //       }
  //     );
  //   }
  // });
