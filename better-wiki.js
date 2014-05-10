Links = new Meteor.Collection("links");

if (Meteor.isClient) {
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

    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Links.find().count() === 0) {
      Links.insert(
        { name: "geometric objects",
          definition:"Take a look at some basic geometric objects: line, <span><span class='ink'>ray</span></span>, point, etc. Play with these geometric objects. Notice how they move.",
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
