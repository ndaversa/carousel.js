var expect = chai.expect;

describe('Carousel', function () {
  it('can be instantiated', function () {
    var carousel = new Carousel();
    expect(carousel).to.not.be.undefined;
  });

  it('has the correct default values', function () {
    var carousel = new Carousel();
    var carouselOptions = [
      'loop'
    ];
    var pickedOptions = _.pick(carousel, carouselOptions);

    expect(pickedOptions).to.deep.equal({ loop: true });
  });

  it('allows defaults to be overridden', function () {
    var carousel = new Carousel({ loop: false });
    var carouselOptions = [
      'loop'
    ];
    var pickedOptions = _.pick(carousel, carouselOptions);

    expect(pickedOptions).to.deep.equal({ loop: false });
  });
})
