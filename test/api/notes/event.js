var expect = require("chai").expect,
  Mongoose = require("mongoose").Mongoose,
  mongoose = new Mongoose(),
  MockMongoose = require("mock-mongoose").MockMongoose,
  mockMongoose = new MockMongoose(mongoose),
  Event = mongoose.model("Event", { desc: String, voucher: mongoose.ObjectId, maxQuantity: Number, endDate: Date, editable: Boolean});

describe("Event functions", function () {
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
  
  // [POST] /event
  it("should create an event Sale to 50% and Sale off 70%", function (done) {
    Event.insertMany([
      {
        desc: "Sale to 50%", 
        voucher: "62cb2c9341d417930bf0d07b", 
        maxQuantity: 10, 
        endDate: new Date(2000, 1, 1),
        editable: true
      },
      {
        desc: "Sale off 70%", 
        voucher: "b0a28efa4d9a0dab2bd36a0a", 
        maxQuantity: 20, 
        endDate: new Date(2022, 9, 9),
        editable: true
      },
      {
        desc: "Sale 10%", 
        voucher: "b0a28efa4d9a0dab2bd36a0b", 
        maxQuantity: 0, 
        endDate: new Date(2021, 2, 1),
        editable: true
      },
      {
        desc: "Sale 10%", 
        voucher: "b0a28efa4d9a0dab2bd36a0b", 
        maxQuantity: 5, 
        endDate: new Date(2020, 3, 2),
        editable: false
      },
        ], function (err, event) {
      expect(err).to.be.null;
      done(err);
    });
  });

  // [GET] /event/{id}
  it("should find event Sale to 50%", function (done) {
    Event.findOne({ desc: "Sale to 50%" }, function (err, event) {
      expect(err).to.be.null;
      expect(event.desc).to.be.equal("Sale to 50%");
      done(err);
    });
  });

  // [GET] /event/all
  it("should find all events", function (done) {
    Event.find({}, function (err, event) {
      expect(err).to.be.null;
      expect(event)
      done(err);
    });
  });

  // [POST] /event/{id}/editable/maintain
  it("should make event to uneditable", function (done) {
    Event.updateOne({desc: "Sale to 50%"}, {$set: {editable: false}}, function (err, event) {
        expect(err).to.be.null;
        expect(event)
        done(err);
    });
  });

  // [POST] /event/{id}/editable/me
  it("should check if event is editable", function (done) {
    Event.findOne({$and: [{desc: "Sale to 50%"}, {editable: true}]}, function (err, event) {
        expect(err).to.be.null;
        expect(event)
        done(err);
    });
  });

  // [POST] /event/{id}/getVoucher
  it("should get voucher from event Sale to 50%", function (done) {
    Event.updateOne({
      $and: [{ desc: "Sale to 50%"}, {maxQuantity: {$gt: 0}}]},
      {$inc: { maxQuantity: -1 }}, function (err, event) {
        expect(err).to.be.null;
        expect(event)
        done(err);
    });
  });

  // [PUT] /event/{id}
  it("should update max quantiy of event Sale off 70%", function (done) {
    Event.updateOne({desc: "Sale off 70%"},{$set:{ maxQuantity: 0 }}, function (err, event) {
      expect(err).to.be.null;
      done(err);
    });
  });

  // [DELETE] /event/{id}
  it("should remove event Sale to 50%", function (done) {
    Event.deleteOne({ desc: "Sale to 50%" }, function (err, event) {
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
