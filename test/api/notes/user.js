var expect = require("chai").expect,
  Mongoose = require("mongoose").Mongoose,
  mongoose = new Mongoose(),
  MockMongoose = require("mock-mongoose").MockMongoose,
  mockMongoose = new MockMongoose(mongoose),
  User = mongoose.model("User", { username: String });

describe("User functions", function () {
  before(function (done) {
    mockMongoose.prepareStorage().then(function () {
      mongoose.connect(
      "mongodb+srv:admin:admin@hdtrainingcluster.x2gfxia.mongodb.net/?retryWrites=true&w=majority", function (err) {
        done(err);
      });
    });
  });

  it("isMocked", function (done) {
    expect(mockMongoose.helper.isMocked()).to.be.true;
    done();
  });
  
  it("should create a user foo", function (done) {
    User.create({ username: "foo" }, function (err, user) {
      expect(err).to.be.null;
      done(err);
    });
  });

  it("should find user foo", function (done) {
    User.findOne({ username: "foo" }, function (err, user) {
      expect(err).to.be.null;
      expect(user.username).to.be.equal("foo");
      done(err);
    });
  });

  it("should update user foo", function (done) {
    User.updateOne({username: "foo"},{$set:{ username: "bar" }}, function (err, user) {
      expect(err).to.be.null;
      done(err);
    });
  });

  it("should remove user foo", function (done) {
    User.deleteOne({ username: "bar" }, function (err, user) {
      expect(err).to.be.null;
      done(err);
    });
  });

  it("reset mock", function (done) {
    mockMongoose.helper.reset().then(function () {
      done();
    });
  });

  after("Drop db", (done) => {
    mockMongoose.killMongo().then(function () {
      done();
    });
  });
});
