const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('test-for-recipes', function() {
    before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });

    it('should list items on GET', function() {
        return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');

        res.body.length.should.be.at.least(1);

        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });
   it('should add an item on POST', function() {
    const newRecipe = {name: 'coffee', ingredients:['ground coffee','hot water']};
    return chai.request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.should.be.equal(newRecipe.name);
        res.body.ingredients.should.be.a('array');
        res.body.ingredients.should.include.members(newRecipe.ingredients);
      });
  });
   it('should update items on PUT', function() {
       const updateData = {
      name: 'foo',
      ingredients: ['bizz','bangnpm test']
    };
     return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;
        // this will return a promise whose value will be the response
        // object, which we can inspect in the next `then` back. Note
        // that we could have used a nested callback here instead of
        // returning a promise and chaining with `then`, but we find
        // this approach cleaner and easier to read and reason about.
        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })
      // prove that the PUT request has right status code
      // and returns updated item
      .then(function(res) {
        rnes.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.name.should.equal(updateData.name);
        res.body.id.should.equal(updateData.id);
        res.body.ingredients.should.include.members(updateData.ingredients);
      });
  });

  // test strategy:
  //  1. GET a shopping list items so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204
  it('should delete items on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of 
      // to delete
      .get('/recipes')
      .then(function(res) {
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});