/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ResizableModal from '@mapstore/framework/components/misc/ResizableModal';
import Message from '@mapstore/framework/components/I18N/Message';
import { Form, FormGroup, ControlLabel, FormControl as FormControlRB, Alert } from 'react-bootstrap';
import localizedProps from '@mapstore/framework/components/misc/enhancers/localizedProps';
import Loader from '@mapstore/framework/components/misc/Loader';
import Portal from '@mapstore/framework/components/misc/Portal';
const FormControl = localizedProps('placeholder')(FormControlRB);

function SaveModal({
    update,
    error,
    success,
    labelId,
    resource,
    contentId,
    saving,
    loading,
    enabled,
    onClose,
    onSave,
    onClear,
    hideDescription,
    copy
}) {

    const [thumbnail, setThumbnail] =  useState();
    const [name, setName] =  useState('');
    const [description, setDescription] =  useState('');
    const [nameValidation, setNameValidation] =  useState(false);

    const state = useRef();
    state.current = {
        contentId,
        resource
    };

    const currentModal = useRef(null);

    useEffect(() => {
        onClear();
    }, [ enabled ]);

    useEffect(() => {
        if (!loading) {
            const res = state.current.resource || {};
            setThumbnail(res.thumbnail_url);
            setName(res.title);
            setDescription(res.abstract);
            setNameValidation(!res.title
                ? 'error'
                : undefined);
        }
    }, [ enabled, loading ]);

    const isLoading = loading || saving;


    useEffect(() => {
        // clone on enter key press
        if (copy && currentModal?.current) {
            currentModal?.current?.addEventListener('keyup', (event) => {
                if (event.keyCode === 13) {
                    event.stopPropagation();
                    onSave(
                        update ? contentId : undefined,
                        {
                            thumbnail,
                            name,
                            description
                        },
                        true);
                }
            });
        }
        return () => currentModal?.current?.removeEventListener('keyup', () => {});
    }, []);

    return (
        <Portal>
            <div ref={currentModal}>
                <ResizableModal
                    title={<Message msgId={labelId}/>}
                    show={enabled}
                    fitContent
                    clickOutEnabled={false}
                    buttons={isLoading
                        ? []
                        : [
                            {
                                text: <Message msgId="close"/>,
                                onClick: () => onClose()
                            },
                            {
                                text: <Message msgId={labelId}/>,
                                disabled: !!nameValidation,
                                bsStyle: 'primary',
                                onClick: () => onSave(
                                    update ? contentId : undefined,
                                    {
                                        thumbnail,
                                        name,
                                        description
                                    },
                                    true)
                            }
                        ]}
                    onClose={isLoading ? null : () => onClose()}
                >
                    {error && <Alert bsStyle="danger" style={{ margin: 0 }}>
                        <div><Message msgId="map.mapError.errorDefault" /></div>
                    </Alert>}
                    {success && <Alert bsStyle="success" style={{ margin: 0 }}>
                        <div><Message msgId="saveDialog.saveSuccessMessage" /></div>
                    </Alert>}
                    <Form>
                        <FormGroup
                            validationState={nameValidation}
                        >
                            <ControlLabel>
                                <Message msgId="gnviewer.title" />
                            </ControlLabel>
                            <FormControl
                                autoFocus
                                placeholder="gnviewer.titlePlaceholder"
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setNameValidation(!event.target.value
                                        ? 'error'
                                        : undefined);
                                }}
                                onBlur={(event) => {
                                    setNameValidation(!event.target.value
                                        ? 'error'
                                        : undefined
                                    );
                                }}
                            />
                        </FormGroup>
                        {!hideDescription && <FormGroup>
                            <ControlLabel>
                                <Message msgId="saveDialog.description" />
                            </ControlLabel>
                            <FormControl
                                placeholder="saveDialog.descriptionPlaceholder"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        </FormGroup>}
                    </Form>
                    {isLoading && <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Loader size={70}/>
                    </div>}
                </ResizableModal>
            </div>
        </Portal>
    );
}

SaveModal.propTypes = {
    update: PropTypes.bool,
    labelId: PropTypes.string,
    contentId: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]),
    resource: PropTypes.object,
    loading: PropTypes.bool,
    enabled: PropTypes.bool,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    onInit: PropTypes.func,
    onClear: PropTypes.func,
    error: PropTypes.oneOfType([ PropTypes.string, PropTypes.object ]),
    success: PropTypes.oneOfType([ PropTypes.string, PropTypes.object ]),
    thumbnailOptions: PropTypes.object
};

SaveModal.defaultProps = {
    update: false,
    resource: {},
    loading: false,
    enabled: false,
    onClose: () => {},
    onSave: () => {},
    onInit: () => {},
    onClear: () => {},
    thumbnailOptions: {
        width: 300,
        height: 250,
        type: 'image/jpeg',
        quality: 0.9,
        contain: false
    }
};

export default SaveModal;
