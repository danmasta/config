describe('Config', () => {

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
        expect(()=>{ config.mutate = 1000 }).to.throw(TypeError);
        expect(()=>{ config.port = 9999 }).to.throw(TypeError);
    });

    it('should load heirarchically and merge configs', () => {
        expect(config.host).to.equal('localhost');
        expect(config.port).to.equal(8080);
    });

});
