window.slug_search = window.slug_search || (function () {
    let self = {};

    /**
     * Given a query and some resource ids to search on, requests a slug for it and redirects to it.
     *
     * @param query the query object
     * @param resourceIds a list of resource ids
     */
    self.doSearch = function (query, resourceIds) {
        const payload = {};
        if (!!query) {
            payload.query = query;
        }
        payload.resource_ids = resourceIds;

        $.ajax('/api/3/action/datastore_create_slug', {
            method: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/json',
            dataType: 'json'
        }).done(function (json) {
            window.location.href = '/search/' + json.result.slug;
        });
    };

    /**
     * Binds up listeners on the main search bar so that it does things when you click search.
     */
    self.bindMainSearch = function () {
        const mainSearch = $('#main_search');
        const submitButton = mainSearch.find('button');
        const serachInput = $('#q');

        function onSubmit() {
            const query = {};
            const searchValue = serachInput.val();
            if (!!searchValue) {
                query.search = searchValue;
            }

            const resourceIds = [];
            const selection = $('.scope-tab.selected').attr('id');
            if (selection === 'scope-collections') {
                resourceIds.push(
                    // TODO: these need to come from the config
                    'ec61d82a-748d-4b53-8e99-3e708e76bc4d',
                    '05ff2255-c38a-40c9-b657-4ccb55ab2feb',
                    'bb909597-dedf-427d-8c04-4c02b3a24db3'
                );
            } else if (selection === 'scope-specimens') {
                resourceIds.push(
                    // TODO: this needs to come from the config
                    '05ff2255-c38a-40c9-b657-4ccb55ab2feb',
                );
            }

            self.doSearch(query, resourceIds);
        }

        submitButton.on('click', function () {
            onSubmit();
        });

        serachInput.on('keypress',function(e) {
            if (e.which === 13) {
                onSubmit();
            }
        });
    };

    /**
     * Binds click listeners onto the scope selection tabs so that when they are clicked, the
     * selection is changed.
     */
    self.bindScopeSelection = function () {
        const scopeTabs = $('.scope-tabs').find('.scope-tab');
        const specimenStats = $('#scope-specimen-stats');
        const collectionStats = $('#scope-collection-stats');
        const specimensTitle = $('#specimens-title');
        const collectionsTitle = $('#collections-title');
        const everythingTitle = $('#everything-title');


        scopeTabs.each(function () {
            const element = $(this);
            element.on('click', function () {
                scopeTabs.removeClass('selected');
                element.addClass('selected');

                specimensTitle.hide();
                collectionsTitle.hide();
                everythingTitle.hide();

                collectionStats.hide();
                specimenStats.hide();

                switch (element.attr('id')) {
                    case 'scope-specimens':
                        specimensTitle.show();
                        specimenStats.show();
                        break;
                    case 'scope-collections':
                        collectionStats.show();
                        collectionsTitle.show();
                        break;
                    case 'scope-everything':
                        everythingTitle.show();
                        break;
                }
            });
        });
    };

    return self;
}());


// bind up as soon as the document is ready for it
$(document).ready(function () {
    window.slug_search.bindScopeSelection();
    window.slug_search.bindMainSearch();
});
