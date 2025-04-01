import React from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function APINavigation({ spec, setSpec, onEndpointSelect, selectedEndpoint, selectedMethod }) {
    const paths = React.useMemo(() => {
        try {
            const parsedSpec = JSON.parse(spec.spec_content);
            return Object.entries(parsedSpec.paths || {}).map(([path, methods]) => ({
                path,
                methods: Object.keys(methods).filter(m =>
                    ['get', 'post', 'put', 'delete', 'patch'].includes(m.toLowerCase())
                ),
            }));
        } catch (error) {
            console.error('Error parsing API spec:', error);
            return [];
        }
    }, [spec]);

    // Hardcoded chip styles based on Tailwind classes.
    const getChipStyles = (method) => {
        const lower = method.toLowerCase();
        switch (lower) {
            case 'get':
                return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
            case 'post':
                return { backgroundColor: '#DCFCE7', color: '#166534' };
            case 'put':
                return { backgroundColor: '#FFEDD5', color: '#C2410C' };
            case 'delete':
                return { backgroundColor: '#FEE2E2', color: '#991B1B' };
            case 'patch':
                return { backgroundColor: '#FEF9C3', color: '#92400E' };
            default:
                return {};
        }
    };

    return (
        <Box
            sx={{
                height: '100%',
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}>
                    <IconButton
                        onClick={() => setSpec(null)}
                        size="small"
                    >
                        <ChevronLeft />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{spec.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Version: {spec.version}
                    </Typography>
                    </Box>
                </Box>

            </Box>

            <Box sx={{ height: 'calc(100vh - 8rem)', overflowY: 'auto', px: 2 }}>
                {paths.map((endpoint, index) => (
                    <Accordion key={index}
                    slotProps={{
                        transition: {
                            unmountOnExit: true,
                            timeout: { enter: 200, exit: 200 },
                        },
                    }}>
                        <AccordionSummary
                            expandIcon={<ChevronDown style={{ transition: 'transform 0.2s' }} />}
                            aria-controls={`panel-${index}-content`}
                            id={`panel-${index}-header`}
                        >
                            <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                                {endpoint.path}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex'}}>
                                {endpoint.methods.map((method) => {
                                    const lowerMethod = method.toLowerCase();
                                    const isSelected =
                                        selectedEndpoint === endpoint.path && selectedMethod === lowerMethod;
                                    return (
                                        <Box
                                            key={method}
                                            onClick={() => onEndpointSelect(endpoint.path, lowerMethod)}
                                            sx={{
                                                px: 0.5,
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? 'grey.100' : 'transparent',
                                                '&:hover': { backgroundColor: 'grey.50' },
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    px: 1,
                                                    py: 0.5,
                                                    flexGrow: 1,
                                                    borderRadius: 1,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    ...getChipStyles(method),
                                                }}
                                            >
                                                {method.toUpperCase()}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Box>
    );
}
