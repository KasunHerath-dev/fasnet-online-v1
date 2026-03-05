import React, { useState, useEffect, useMemo } from 'react';
import SearchAndFilterBar from './SearchAndFilterBar';
import MaterialLayout from './MaterialLayout';

// Mock Data for UI presentation using WUSL specifics
const MOCK_RESOURCES = [
    { id: 1, title: 'Operating Systems - Process Management', type: 'pdf', date: '2 hours ago', course: 'CMIS1113', description: 'Comprehensive guide to processes and threads.' },
    { id: 2, title: 'C Programming Syntax Guide', type: 'doc', date: '5 hours ago', course: 'CMIS1123', description: 'Quick reference for syntax and arrays.' },
    { id: 3, title: 'Basic Digital Electronics - Logic Gates', type: 'ppt', date: '1 day ago', course: 'ELTN1132', description: 'Slides covering Boolean algebra and logic.' },
    { id: 4, title: 'Probability Distributions', type: 'pdf', date: '2 days ago', course: 'STAT1113', description: 'Notes on Binomial and Normal distributions.' },
    { id: 5, title: 'Linear Algebra Matrices Practice', type: 'link', date: '3 days ago', course: 'MATH2114', description: 'Interactive exercises for finding determinants.' },
    { id: 6, title: 'Business Economics - Supply & Demand', type: 'video', date: '1 week ago', course: 'IMGT1122', description: 'Lecture recording for week 2.' },
    { id: 7, title: 'OOP with Java Seminar', type: 'pdf', date: '2 weeks ago', course: 'CMIS2113', description: 'Advanced guide to inheritance and polymorphism.' },
    { id: 8, title: 'Intro to Semiconductors', type: 'link', date: '1 month ago', course: 'ELTN1122', description: 'Link to the recommended online textbook chapters.' },
];

const ResourceCenter = () => {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ subject: 'all', type: 'all', year: 'all' });

    useEffect(() => {
        // Simulate API fetch
        const fetchResources = async () => {
            setIsLoading(true);
            setTimeout(() => {
                setResources(MOCK_RESOURCES);
                setIsLoading(false);
            }, 800);
        };
        fetchResources();
    }, []);

    // Memoized filtering logic
    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                res.course.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSubject = filters.subject === 'all' || res.course === filters.subject;
            const matchesType = filters.type === 'all' || res.type === filters.type;

            return matchesSearch && matchesSubject && matchesType;
        });
    }, [resources, searchQuery, filters]);

    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto font-sans min-h-full">

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <SearchAndFilterBar
                    onSearch={setSearchQuery}
                    filters={filters}
                    setFilters={setFilters}
                />
            </div>

            <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <MaterialLayout
                    resources={filteredResources}
                    isLoading={isLoading}
                />
            </div>

        </div>
    );
};

export default ResourceCenter;
