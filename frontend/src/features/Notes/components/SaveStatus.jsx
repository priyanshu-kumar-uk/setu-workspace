import React from 'react'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'
const SaveStatus = ({ status }) => {
    if (status === 'idle') return null
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#9CA3AF',
            fontSize: '11px',
            fontWeight: '500'
        }}>
            {status === 'saving' && (
                <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Saving...</span>
                </>
            )}
            {status === 'saved' && (
                <>
                    <Cloud size={12} />
                    <span>Saved</span>
                </>
            )}
            {status === 'error' && (
                <>
                    <CloudOff size={12} color="#EF4444" />
                    <span style={{ color: '#EF4444' }}>Error</span>
                </>
            )}
        </div>
    )
}
export default SaveStatus
