describe('config', () => {

    it('should be an object', () => {

        expect(config).to.be.an('object');

    });

    it('should load default config', () => {

        expect(config).to.have.property('test1');
        expect(config).to.have.property('test2');
        expect(config).to.have.property('test3');
        expect(config).to.have.property('test4');
        expect(config).to.have.property('host');
        expect(config).to.have.property('port');

    });

    it('should export an immutable object', () => {

        config.mutate = 1000;
        config.port = 9999;

        expect(config.mutate).to.be.undefined;
        expect(config.port).to.equal(8080);

    });

    it('should load heirarchically and merge configs', () => {

        expect(config.host).to.equal('localhost');
        expect(config.port).to.equal(8080);

    });

});
