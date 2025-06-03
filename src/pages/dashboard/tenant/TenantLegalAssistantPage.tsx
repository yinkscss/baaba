import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Scale, FileText, MessageSquare } from 'lucide-react';
import Button from '../../../components/ui/Button';

const TenantLegalAssistantPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Legal Assistant
        </h1>
        <p className="mt-1 text-text-secondary">
          Get expert legal advice and document reviews
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-nav">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
              <Scale className="h-6 w-6 text-accent-blue" />
            </div>
            <CardTitle>Legal Advice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-text-secondary">
              Get instant answers to your legal questions from our AI assistant
            </p>
            <Button onClick={() => navigate('/legal-assistant')}>
              Ask a Question
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
              <FileText className="h-6 w-6 text-accent-blue" />
            </div>
            <CardTitle>Document Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-text-secondary">
              Upload your lease agreement for AI-powered review
            </p>
            <Button variant="outline">Upload Document</Button>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
              <MessageSquare className="h-6 w-6 text-accent-blue" />
            </div>
            <CardTitle>Legal Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-text-secondary">
              Schedule a consultation with a legal expert
            </p>
            <Button variant="outline">Book Consultation</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantLegalAssistantPage;