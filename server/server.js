Wiki = new Meteor.Collection("wiki");
Links = new Meteor.Collection("links");

Meteor.methods({
  updateText: function (id, name, slug, text) {
    Wiki.upsert({_id:id},
      {
        name: name,
        slug: slug,
        definition: text
      }
    );
  },
  addLink: function (title,slug,order) {
    Links.insert({
      title: title,
      slug: slug,
      order: order,
    });
  },
  updateLinkOrder: function (id, neworder) {
    // check(order, Number);
    Links.update(
      {_id:id},
      {$set:
        {order: neworder}
      }
    )
  },
  updateMenu: function (content) {
    Links.upsert({_id:content.id},
      {
        order: content.order,
        title: content.title,
        slug: content.slug,
        links: content.links
      }
    )
  }
});

Meteor.publish('Terms', function () {
  return Wiki.find();
});

Meteor.publish('Link-List', function () {
  return Links.find();
})

Meteor.startup(function () {
  if (Links.find().count() === 0) {
    Links.insert({
      title: 'First List',
      slug: 'topic-1',
      order: 0,
    });
    Links.insert({
      title: 'Second List',
      slug: 'ray',
      order: 1,
    });
    Links.insert({
      title: 'Third List',
      slug: 'geometric-objects',
      order: 2,
    });
  }
  if (Wiki.find().count() === 0) {
    Wiki.insert(
      { name: "Topic 1",
        slug: "topic-1",
        definition: "In mathematics and theoretical physics, mirror symmetry is a relationship between two <a href='geometric objects'>geometric objects</a> called Calabi–Yau manifolds. It can happen that two Calabi–Yau manifolds look very different geometrically but are nevertheless equivalent if they are employed as extra dimensions of string theory. In this case, the manifolds are called mirror manifolds."
      }
    );
    Wiki.insert(
      { name: "geometric objects",
        slug: "geometric-objects",
        definition:"Take a look at some basic geometric objects: line, <a href='ray'>ray</a>, point, etc. Play with these geometric objects. Notice how they move.",
      }
    );
    Wiki.insert(
      { name: "ray",
        slug: "ray",
        definition:"what is a ray? a ray is a line with a direction, think about lazers, that is what a ray is. Lorem Ipsom",
      }
    );
  }
});