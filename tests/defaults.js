describe('defaults', () => {

    it('should load file and add properties', () => {

        let local = config._defaults('./config/test');

        expect(local.db).to.be.a('string');

    });

    it('should not override existing properties', () => {

        let local = config._defaults('./config/test');

        expect(local.host).to.equal('redis://127.0.0.1');
        expect(local.port).to.equal(6379);

    });

    it('should be a local copy', () => {

        let local = config._defaults('./config/test');

        expect(local === config).to.be.false;

    });

});
