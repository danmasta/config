describe('merge', () => {

    it('should load file and add properties', () => {

        let local = config._merge('./config/test');

        expect(local.db).to.be.a('string');

    });

    it('should override existing properties', () => {

        let local = config._merge('./config/test');

        expect(local.host).to.equal('localhost');
        expect(local.port).to.equal(8080);

    });

    it('should be a local copy', () => {

        let local = config._merge('./config/test');

        expect(local === config).to.be.false;

    });


});
