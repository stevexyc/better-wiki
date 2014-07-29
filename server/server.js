Wiki = new Meteor.Collection("wiki");
Links = new Meteor.Collection("links");

Meteor.methods({
  newItem: function (name, slug, text) {
    Wiki.insert({
      name: name,
      slug: slug,
      definition: text
    })
  },
  updateItem: function (id, name, slug, text) {
    Wiki.upsert({_id:id},
      {
        name: name,
        slug: slug,
        definition: text
      }
    );
  },
  deleteItem: function (id) {
    Wiki.remove({_id: id})
  },
  addLink: function (title,slug,order) {
    Links.insert({
      title: title,
      slug: slug,
      order: order,
    });
  },
  deleteLink: function (id) {
    Links.remove({_id: id});
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

Accounts.config({
  forbidClientAccountCreation: true
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
        definition: "<div class='panel'>In mathematics and theoretical physics, mirror symmetry is a relationship between two <a href='Geometric Objects'>geometric objects</a> called Calabi–Yau manifolds. It can happen that two Calabi–Yau manifolds look very different geometrically but are nevertheless equivalent if they are employed as extra dimensions of string theory. In this case, the manifolds are called mirror manifolds.</div>"
      }
    );
    Wiki.insert(
      { name: "Geometric Objects",
        slug: "geometric-objects",
        definition:"<div class='panel'>Take a look at some basic geometric objects: line, <a href='Ray'>ray</a>, point, etc. Play with these geometric objects. Notice how they move.</div>",
      }
    );
    Wiki.insert(
      { name: "Ray",
        slug: "ray",
        definition:"<div class='panel'>what is a ray? a ray is a line with a direction, think about lazers, that is what a ray is. Lorem Ipsom</div>",
      }
    );
  };
  if (Meteor.users.find().count() === 0) {
    Accounts.createUser({
      username: 'admin',
      email: 'info@stevexchen.com',
      password: 'imadoofus',
    })
  };
});
