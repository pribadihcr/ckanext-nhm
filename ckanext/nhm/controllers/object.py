import ckan.logic as logic
import ckan.lib.base as base
import ckan.model as model
from ckan.common import _, c
import ckan.lib.helpers as h
import ckan.plugins as p
import logging
from pylons import config
from ckanext.dcat.utils import CONTENT_TYPES
from ckanext.dcat.controllers import check_access_header
from ckanext.nhm.lib.record import get_record_by_uuid

log = logging.getLogger(__name__)

abort = base.abort
get_action = logic.get_action

# FIXME - specimen, lot, artefact

# Temporary fix for the ABYSSLINE dataset

ABYSSLINE_UUIDS = [
    'bc03fc1a-3613-41a2-b1f1-bf905e0fa6d0',
    'de4bd6ce-07fe-496e-bffc-67a4c6b9782c',
    '16599946-2aba-4710-98e6-43c522061878',
    'b7ffe7a2-7be1-4d4f-b784-7aaecf0ee743',
    '76acc5a2-6e0e-4599-8104-b8e243af10c4',
    '7e8ca2d8-aea1-45bd-b7e0-d0575cadd82d',
    '95d0bd7f-0df9-47e4-8003-cd12007d54b4',
    'c57f1bd3-1b32-41e6-8e1d-0ad6472e4327',
    'd15a68e0-b2b3-40b4-8cab-0563609cc80d',
    '4ae2430e-549e-47f2-ba5d-0e9a08443d31',
    'b2a871bf-46d5-4639-a839-427a3efa848c',
    '280c758b-5287-4a13-9f45-f6a6150b37d0',
    '92825c07-a16d-4c5e-a8e9-4fbcdc8cf44a',
    '2866f91e-b99e-4703-a9d3-fe1876df1da1',
    'd0062182-89dc-4deb-b746-688289783b5f',
    '38c16bec-7bf9-4c2b-b862-5da460ba6c0c',
    '15e6ddc7-3ca7-453c-bba5-f84888716505',
    '72db478a-ea4f-4f3e-be08-95ec9fb4d20e',
    '11948cb9-654f-4519-a654-f134380093ea',
    '292bd655-83d6-440f-9668-82dfa4185b04',
    '2ed865af-1605-4d78-8fd8-9c7659781854',
    '4d6f6aaf-93fd-4629-b224-2ce8dd3320f6',
    '5ad996fe-134a-4625-a404-9d0cdae435d4',
    '68072fc9-3e84-4202-8e97-6c9c0c5fc83d',
    'c1c4d8f3-6cd5-439f-a546-943b5e2e8d8f',
    '479218ae-813b-4736-b3f2-7eec63640ffd',
    '90e22ace-ef5d-4cb5-a4a5-29fcd55ed660',
    '97d40306-fe6c-4911-8e68-1f9efc3d838f',
    'bd6fe2ce-b4ae-470e-8bdc-cf28a94c6208',
    '608349ff-5adf-4e1e-8cd7-7e0e41aee222',
    '241d094a-568f-4194-997c-fd08f67dcdac',
    '93b0a70d-c74e-4735-b70e-0c6e4c6a36ff',
    'e9f38ce3-5ed5-49f3-8713-c26de2eefd2b',
    'f263bc90-6307-462c-9e02-7b87d20e2840'
]


class ObjectController(base.BaseController):
    """

    Controller for handling stable objects - those with GUIDs in KE EMu

    If someone accesses URL:
        object/73f450db-46b3-45a0-ac18-f00547be5af1
    It will 302 redirect to the specimen, artefact or index lot page

    If a user requests the object in RDF format:
        object/73f450db-46b3-45a0-ac18-f00547be5af1.ttl
    Returns RDF

    """

    def __before__(self, action, **env):

        base.BaseController.__before__(self, action, **env)
        self.context = {'model': model, 'user': c.user or c.author, 'auth_user_obj': c.userobj}

    def view(self, uuid):
        """
        View object
        If this is basic HTTP request, this will redirect to the record
        If the request is for RDF (content negotiation) return the rdf
        """

        # FIXME: Horrible hack to work with Abyssline dataset
        if uuid in ABYSSLINE_UUIDS:
            self.abyssline_object_redirect(uuid)

        # Is the request for a particular format
        _format = check_access_header()

        if _format:
            return self.rdf(uuid, _format)
        else:
            try:
                # This is a normal HTTP request, so redirect to the object record
                record, resource = get_record_by_uuid(uuid)
            except TypeError:
                pass
            else:
                if record:
                    package_id = resource.get_package_id()
                    package = get_action('package_show')(self.context, {'id': package_id})
                    h.redirect_to(controller='ckanext.nhm.controllers.record:RecordController', action='view', package_name=package['name'], resource_id=resource.id, record_id=record['_id'])

        abort(404, _('Record not found'))

    def rdf(self, uuid, _format):
        """
        Return RDF
        :param uuid:
        :param _format:
        :return:
        """
        data_dict = {
            'uuid': uuid,
            'format': _format,
        }

        p.toolkit.response.headers.update(
            {'Content-type': CONTENT_TYPES[_format]})
        try:
            return p.toolkit.get_action('object_rdf')(self.context, data_dict)
        except p.toolkit.ValidationError, e:
            p.toolkit.abort(409, str(e))

    def abyssline_object_redirect(self, uuid):
        """
        Temporary fix to allow abyssline object references to resolve to the temp dataset
        :param uuid:
        :return:
        """

        resource_id = config.get("ckanext.nhm.abyssline_resource_id")

        print(resource_id)

        context = {'model': model, 'session': model.Session, 'user': c.user or c.author}
        search_result = get_action('datastore_search')(context, {'resource_id': resource_id, 'filters': {'catalogNumber': uuid}})

        print(search_result)

        try:
            record = search_result['records'][0]
            h.redirect_to(controller='ckanext.nhm.controllers.record:RecordController', action='view', package_name='abyssline', resource_id=resource_id, record_id=record['_id'])
        except:
            pass

        abort(404, _('Record not found'))