const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border mt-auto py-3 sm:py-12 px-[1rem] sm:px-[5rem]">
      <div className="container-custom">
        <div className="border-border text-center text-xs text-text-muted">
          <p>
            &copy; {new Date().getFullYear()} ThreadCo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

