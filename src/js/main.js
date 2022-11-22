var App = App || {};

(function() {

	App.models = {};
	App.views = {};
	App.targetID = '#visPane';

	App.init = function() {
		App.models.data = new DataModel();
		App.views.genomeView = new GenomeView(App.targetID)

		App.models.data.loadData()
			.then(() => {
				App.views.genomeView.setExportFileName(`index${App.models.data.getDataFileIndex()}_genomeView`)
									.data(App.models.data.getData())
									.draw();
			})
	}
})();