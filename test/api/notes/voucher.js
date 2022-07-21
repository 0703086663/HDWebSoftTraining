var expect = require("chai").expect,
  Mongoose = require("mongoose").Mongoose,
  mongoose = new Mongoose(),
  MockMongoose = require("mock-mongoose").MockMongoose,
  mockMongoose = new MockMongoose(mongoose),
  Voucher = mongoose.model("Voucher", { name: String });

describe("Voucher functions", function () {
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
  
  it("should create a voucher SALETO50", function (done) {
    Voucher.create({ name: "SALETO50" }, function (err, voucher) {
      expect(err).to.be.null;
      done(err);
    });
  });

  it("should find voucher SALETO50", function (done) {
    Voucher.findOne({ name: "SALETO50" }, function (err, voucher) {
      expect(err).to.be.null;
      expect(voucher.name).to.be.equal("SALETO50");
      done(err);
    });
  });

  it("should find all vouchers ", function (done) {
    Voucher.find({}, function (err, voucher) {
      expect(err).to.be.null;
      expect(voucher)
      done(err);
    });
  });

  it("should remove voucher SALETO50", function (done) {
    Voucher.deleteOne({ name: "SALETO50" }, function (err, voucher) {
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
