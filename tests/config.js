describe('config', () => {

    it('should be an object', () => {

        expect(config).to.be.an('object');

    });

    it('should have _merge function', () => {

        expect(config._merge).to.be.a('function');

    });

    it('should have _defaults function', () => {

        expect(config._defaults).to.be.a('function');

    });

    it('should have _from function', () => {

        expect(config._from).to.be.a('function');

    });

    it('should load default config', () => {

        expect(config).to.have.property('test1');
        expect(config).to.have.property('test2');
        expect(config).to.have.property('test3');
        expect(config).to.have.property('test4');
        expect(config).to.have.property('host');
        expect(config).to.have.property('port');

    });

});
