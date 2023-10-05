var App = App || {};

(function() {

	App.models = {};
	App.views = {};
	App.targetID = '#visPane';

	App.init = function(fielID) {
		App.models.data = new DataModel(fielID);
		App.views.genomeView = new GenomeView(App.targetID)

		App.models.data.loadData()
			.then(() => {
				App.views.genomeView.setExportFileName(`index${fielID}_genomeView`)
									.data(App.models.data.getData())
									.draw();
			})
	}
})();