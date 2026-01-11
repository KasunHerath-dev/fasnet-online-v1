import React from 'react';

export default function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-gray-500 mt-1 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex flex-wrap gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
